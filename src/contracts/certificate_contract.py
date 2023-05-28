from pyteal import *


class Certificate_Registry:

    # we'll be using 64 global variables of bytes int to store the certificate hashes,
    # with the certificate hashes as the key

    # we'll also be using the 16 local state key-value pair to store the certificate names

    class App_Methods:
        add_cert = Bytes("add")
        check_cert = Bytes("check")
        delete_cert = Bytes("delete")

    def application_creation(self):
        return Return(Txn.note() == Bytes("certregistry:uv02"))

    def opt_in(self):
        return Approve()

    def add_cert(self):
        cert_key = ScratchVar(TealType.bytes)
        cert_name = ScratchVar(TealType.bytes)
        check_user_storage = App.localGetEx(
            Txn.accounts[0], Txn.applications[0], cert_name.load()
        )
        check_global_state = App.globalGetEx(
            Txn.applications[0], cert_key.load()
        )
        return Seq([
            Assert(
                And(
                    # check that user has opted in
                    App.optedIn(Txn.accounts[0], Txn.applications[0]),
                    # The number of transactions within the group transaction must be exactly 2.
                    Global.group_size() == Int(2),
                    # Check that this call is first in group
                    Txn.group_index() == Int(0),
                    # The number of arguments attached to the transaction should be exactly 3.
                    # the appmethod, certificate name, and certificate hash
                    Txn.application_args.length() == Int(3),
                    # checks for payment transaction
                    Gtxn[1].type_enum() == TxnType.Payment,
                    Gtxn[1].receiver() == Global.creator_address(),
                    Gtxn[1].amount() == Int(1000000),
                    Gtxn[1].sender() == Gtxn[0].sender(),
                ),
            ),
            # store name of cert
            cert_name.store(Txn.application_args[1]),

            # check user storage for name
            check_user_storage,

            # rehash the certificates hash.
            cert_key.store(Keccak256(Txn.application_args[2])),

            # check global state
            check_global_state,

            # store in global state if name does not exist
            If(
                And(
                    Not(check_global_state.hasValue()),
                    Not(check_user_storage.hasValue())
                )
            )
            .Then(
                # store certificate name as key and hash in creator localstorage
                App.localPut(Txn.accounts[0], cert_name.load(), cert_key.load()),

                # store hash
                App.globalPut(cert_key.load(), Global.latest_timestamp()),

                Approve(),
            ).Else(
                Reject()
            ),
        ])

    def check_cert(self):
        cert_key = ScratchVar(TealType.bytes)
        get_cert_value = App.globalGetEx(Txn.applications[0], cert_key.load())
        return Seq([
            Assert(
                And(
                    # The number of transactions within the group transaction must be exactly 2.
                    Global.group_size() == Int(2),
                    # Check that this call is first in group
                    Txn.group_index() == Int(0),

                    # The number of arguments attached to the transaction should be exactly 2.
                    Txn.application_args.length() == Int(2),

                    # checks for payment transaction
                    Gtxn[1].type_enum() == TxnType.Payment,
                    Gtxn[1].receiver() == Global.creator_address(),
                    Gtxn[1].amount() == Int(100000),
                    Gtxn[1].sender() == Gtxn[0].sender(),
                ),
            ),
            # rehash the certificates hash.
            cert_key.store(Keccak256(Txn.application_args[1])),

            # check global state to see if key exists,
            get_cert_value,

            If(get_cert_value.hasValue())
            .Then(
                Approve()
            )
            .Else(
                Reject()
            )
        ])

    def delete_cert(self):
        cert_name = ScratchVar(TealType.bytes)
        cert_key = ScratchVar(TealType.bytes)
        get_cert_value = App.globalGetEx(Txn.applications[0], cert_key.load())
        check_user_storage = App.localGetEx(
            Txn.accounts[0], Txn.applications[0], cert_name.load()
        )
        return Seq([
            Assert(
                And(
                    # check that user has opted in,
                    App.optedIn(Txn.accounts[0], Txn.applications[0]),
                    # The number of arguments attached to the transaction should be exactly 2.
                    Txn.application_args.length() == Int(2),
                ),
            ),
            # store cert name,
            cert_name.store(Txn.application_args[1]),

            # check user local storage for certificate name
            check_user_storage,

            Assert(check_user_storage.hasValue()),

            # store cert hash
            cert_key.store(check_user_storage.value()),

            # check global state for certificate hash
            get_cert_value,

            # delete cert hash if cert exists
            If(get_cert_value.hasValue())
            .Then(
                # delete certificate hash
                App.globalDel(cert_key.load()),
                App.localDel(Txn.accounts[0], cert_name.load()),
                Approve(),
            )
            .Else(
                Reject()
            )
        ])

    def application_deletion(self):
        return Return(Global.creator_address() == Txn.sender())

    def application_start(self):
        return Cond(
            [Txn.application_id() == Int(0), self.application_creation()],
            [Txn.on_completion() == OnComplete.DeleteApplication,
             self.application_deletion()],
            [Txn.on_completion() == OnComplete.OptIn, self.opt_in()],
            [Txn.application_args[0] == self.App_Methods.add_cert, self.add_cert()],
            [Txn.application_args[0] == self.App_Methods.check_cert, self.check_cert()],
            [Txn.application_args[0] == self.App_Methods.delete_cert, self.delete_cert()],
        )

    def approval_program(self):
        return self.application_start()

    def clear_program(self):
        return Approve()
