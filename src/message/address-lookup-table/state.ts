import * as BufferLayout from '@solana/buffer-layout';
import BN from 'bn.js';

import assert from '../../util/assert';
import * as Layout from '../../layout';
import {PublicKey} from '../../publickey';
import {decodeData} from '../../account-data';

export type AddressLookupTableState = {
  deactivationSlot: number;
  lastExtendedSlot: number;
  lastExtendedSlotStartIndex: number;
  authority?: PublicKey;
  addresses: Array<PublicKey>;
};

export type AddressLookupTableAccountArgs = {
  key: PublicKey;
  state: AddressLookupTableState;
};

/// The serialized size of lookup table metadata
const LOOKUP_TABLE_META_SIZE = 56;

export class AddressLookupTableAccount {
  key: PublicKey;
  state: AddressLookupTableState;

  constructor(args: AddressLookupTableAccountArgs) {
    this.key = args.key;
    this.state = args.state;
  }

  isActive(): boolean {
    const U64_MAX = new BN('0xffffffffffffffff');
    return new BN(this.state.deactivationSlot).eq(U64_MAX);
  }

  static deserialize(accountData: Uint8Array): AddressLookupTableState {
    const meta = <typeof LookupTableMetaLayout.layout>(
      decodeData(LookupTableMetaLayout, accountData)
    );

    const serializedAddressesLen = accountData.length - LOOKUP_TABLE_META_SIZE;
    assert(serializedAddressesLen >= 0, 'lookup table is invalid');
    assert(serializedAddressesLen % 32 === 0, 'lookup table is invalid');

    const numSerializedAddresses = serializedAddressesLen / 32;
    const {addresses} = <{addresses: Array<Uint8Array>}>(
      (<unknown>(
        BufferLayout.struct([
          BufferLayout.seq(
            Layout.publicKey(),
            numSerializedAddresses,
            'addresses',
          ),
        ]).decode(accountData.slice(LOOKUP_TABLE_META_SIZE))
      ))
    );

    return {
      deactivationSlot: meta.deactivationSlot,
      lastExtendedSlot: meta.lastExtendedSlot,
      lastExtendedSlotStartIndex: meta.lastExtendedStartIndex,
      authority:
        meta.authority.length !== 0
          ? new PublicKey(meta.authority[0])
          : undefined,
      addresses: addresses.map(address => new PublicKey(address)),
    };
  }
}

const LookupTableMetaLayout = {
  index: 1,
  layout: <
    {
      typeIndex: number;
      deactivationSlot: number;
      lastExtendedSlot: number;
      lastExtendedStartIndex: number;
      authority: Array<Uint8Array>;
    } & BufferLayout.Structure
  >BufferLayout.struct([
    BufferLayout.u32('typeIndex'),
    BufferLayout.nu64('deactivationSlot'), // TODO: this has to be bigint
    BufferLayout.nu64('lastExtendedSlot'),
    BufferLayout.u8('lastExtendedStartIndex'),
    BufferLayout.u8(), // option
    BufferLayout.seq(
      Layout.publicKey(),
      BufferLayout.offset(BufferLayout.u8(), -1),
      'authority',
    ),
  ]),
};
