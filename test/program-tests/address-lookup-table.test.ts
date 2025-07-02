import {expect, use} from 'chai';
import chaiAsPromised from 'chai-as-promised';

import {
  Keypair,
  AddressLookupTableProgram,
  Transaction,
  AddressLookupTableInstruction,
} from '../../src';

use(chaiAsPromised);

describe('AddressLookupTableProgram', () => {
  it('createAddressLookupTable', () => {
    const recentSlot = 0;
    const authorityPubkey = Keypair.generate().publicKey;
    const payerPubkey = Keypair.generate().publicKey;
    const [instruction] = AddressLookupTableProgram.createLookupTable({
      authority: authorityPubkey,
      payer: payerPubkey,
      recentSlot,
    });

    const transaction = new Transaction().add(instruction);
    const createLutParams = {
      authority: authorityPubkey,
      payer: payerPubkey,
      recentSlot,
    };
    expect(transaction.instructions).to.have.length(1);
    expect(createLutParams).to.eql(
      AddressLookupTableInstruction.decodeCreateLookupTable(instruction),
    );
  });

  it('extendLookupTableWithPayer', () => {
    const lutAddress = Keypair.generate().publicKey;
    const authorityPubkey = Keypair.generate().publicKey;
    const payerPubkey = Keypair.generate().publicKey;

    const addressesToAdd = [
      Keypair.generate().publicKey,
      Keypair.generate().publicKey,
      Keypair.generate().publicKey,
      Keypair.generate().publicKey,
    ];

    const instruction = AddressLookupTableProgram.extendLookupTable({
      lookupTable: lutAddress,
      authority: authorityPubkey,
      payer: payerPubkey,
      addresses: addressesToAdd,
    });
    const transaction = new Transaction().add(instruction);
    const extendLutParams = {
      lookupTable: lutAddress,
      authority: authorityPubkey,
      payer: payerPubkey,
      addresses: addressesToAdd,
    };
    expect(transaction.instructions).to.have.length(1);
    expect(extendLutParams).to.eql(
      AddressLookupTableInstruction.decodeExtendLookupTable(instruction),
    );
  });

  it('extendLookupTableWithoutPayer', () => {
    const lutAddress = Keypair.generate().publicKey;
    const authorityPubkey = Keypair.generate().publicKey;

    const addressesToAdd = [
      Keypair.generate().publicKey,
      Keypair.generate().publicKey,
      Keypair.generate().publicKey,
      Keypair.generate().publicKey,
    ];

    const instruction = AddressLookupTableProgram.extendLookupTable({
      lookupTable: lutAddress,
      authority: authorityPubkey,
      addresses: addressesToAdd,
    });
    const transaction = new Transaction().add(instruction);
    const extendLutParams = {
      lookupTable: lutAddress,
      authority: authorityPubkey,
      payer: undefined,
      addresses: addressesToAdd,
    };
    expect(transaction.instructions).to.have.length(1);
    expect(extendLutParams).to.eql(
      AddressLookupTableInstruction.decodeExtendLookupTable(instruction),
    );
  });

  it('closeLookupTable', () => {
    const lutAddress = Keypair.generate().publicKey;
    const authorityPubkey = Keypair.generate().publicKey;
    const recipientPubkey = Keypair.generate().publicKey;

    const instruction = AddressLookupTableProgram.closeLookupTable({
      lookupTable: lutAddress,
      authority: authorityPubkey,
      recipient: recipientPubkey,
    });
    const transaction = new Transaction().add(instruction);
    const closeLutParams = {
      lookupTable: lutAddress,
      authority: authorityPubkey,
      recipient: recipientPubkey,
    };
    expect(transaction.instructions).to.have.length(1);
    expect(closeLutParams).to.eql(
      AddressLookupTableInstruction.decodeCloseLookupTable(instruction),
    );
  });

  it('freezeLookupTable', () => {
    const lutAddress = Keypair.generate().publicKey;
    const authorityPubkey = Keypair.generate().publicKey;

    const instruction = AddressLookupTableProgram.freezeLookupTable({
      lookupTable: lutAddress,
      authority: authorityPubkey,
    });
    const transaction = new Transaction().add(instruction);
    const freezeLutParams = {
      lookupTable: lutAddress,
      authority: authorityPubkey,
    };
    expect(transaction.instructions).to.have.length(1);
    expect(freezeLutParams).to.eql(
      AddressLookupTableInstruction.decodeFreezeLookupTable(instruction),
    );
  });

  it('deactivateLookupTable', () => {
    const lutAddress = Keypair.generate().publicKey;
    const authorityPubkey = Keypair.generate().publicKey;

    const instruction = AddressLookupTableProgram.deactivateLookupTable({
      lookupTable: lutAddress,
      authority: authorityPubkey,
    });

    const transaction = new Transaction().add(instruction);
    const deactivateLutParams = {
      lookupTable: lutAddress,
      authority: authorityPubkey,
    };
    expect(transaction.instructions).to.have.length(1);
    expect(deactivateLutParams).to.eql(
      AddressLookupTableInstruction.decodeDeactivateLookupTable(instruction),
    );
  });
});
