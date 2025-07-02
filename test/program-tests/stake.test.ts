import {expect, use} from 'chai';
import chaiAsPromised from 'chai-as-promised';

import {
  Keypair,
  Authorized,
  Lockup,
  PublicKey,
  StakeAuthorizationLayout,
  StakeInstruction,
  StakeProgram,
  SystemInstruction,
  Transaction,
} from '../../src';

use(chaiAsPromised);

describe('StakeProgram', () => {
  it('createAccountWithSeed', async () => {
    const fromPubkey = Keypair.generate().publicKey;
    const seed = 'test string';
    const newAccountPubkey = await PublicKey.createWithSeed(
      fromPubkey,
      seed,
      StakeProgram.programId,
    );
    const authorizedPubkey = Keypair.generate().publicKey;
    const authorized = new Authorized(authorizedPubkey, authorizedPubkey);
    const lockup = new Lockup(0, 0, fromPubkey);
    const lamports = 123;
    const transaction = StakeProgram.createAccountWithSeed({
      fromPubkey,
      stakePubkey: newAccountPubkey,
      basePubkey: fromPubkey,
      seed,
      authorized,
      lockup,
      lamports,
    });
    expect(transaction.instructions).to.have.length(2);
    const [systemInstruction, stakeInstruction] = transaction.instructions;
    const systemParams = {
      fromPubkey,
      newAccountPubkey,
      basePubkey: fromPubkey,
      seed,
      lamports,
      space: StakeProgram.space,
      programId: StakeProgram.programId,
    };
    expect(systemParams).to.eql(
      SystemInstruction.decodeCreateWithSeed(systemInstruction),
    );
    const initParams = {stakePubkey: newAccountPubkey, authorized, lockup};
    expect(initParams).to.eql(
      StakeInstruction.decodeInitialize(stakeInstruction),
    );
  });

  it('createAccount', () => {
    const fromPubkey = Keypair.generate().publicKey;
    const newAccountPubkey = Keypair.generate().publicKey;
    const authorizedPubkey = Keypair.generate().publicKey;
    const authorized = new Authorized(authorizedPubkey, authorizedPubkey);
    const lockup = new Lockup(0, 0, fromPubkey);
    const lamports = 123;
    const transaction = StakeProgram.createAccount({
      fromPubkey,
      stakePubkey: newAccountPubkey,
      authorized,
      lockup,
      lamports,
    });
    expect(transaction.instructions).to.have.length(2);
    const [systemInstruction, stakeInstruction] = transaction.instructions;
    const systemParams = {
      fromPubkey,
      newAccountPubkey,
      lamports,
      space: StakeProgram.space,
      programId: StakeProgram.programId,
    };
    expect(systemParams).to.eql(
      SystemInstruction.decodeCreateAccount(systemInstruction),
    );

    const initParams = {stakePubkey: newAccountPubkey, authorized, lockup};
    expect(initParams).to.eql(
      StakeInstruction.decodeInitialize(stakeInstruction),
    );
  });

  it('delegate', () => {
    const stakePubkey = Keypair.generate().publicKey;
    const authorizedPubkey = Keypair.generate().publicKey;
    const votePubkey = Keypair.generate().publicKey;
    const params = {
      stakePubkey,
      authorizedPubkey,
      votePubkey,
    };
    const transaction = StakeProgram.delegate(params);
    expect(transaction.instructions).to.have.length(1);
    const [stakeInstruction] = transaction.instructions;
    expect(params).to.eql(StakeInstruction.decodeDelegate(stakeInstruction));
  });

  it('authorize', () => {
    const stakePubkey = Keypair.generate().publicKey;
    const authorizedPubkey = Keypair.generate().publicKey;
    const newAuthorizedPubkey = Keypair.generate().publicKey;
    const stakeAuthorizationType = StakeAuthorizationLayout.Staker;
    const params = {
      stakePubkey,
      authorizedPubkey,
      newAuthorizedPubkey,
      stakeAuthorizationType,
    };
    const transaction = StakeProgram.authorize(params);
    expect(transaction.instructions).to.have.length(1);
    const [stakeInstruction] = transaction.instructions;
    expect(params).to.eql(StakeInstruction.decodeAuthorize(stakeInstruction));
  });

  it('authorize with custodian', () => {
    const stakePubkey = Keypair.generate().publicKey;
    const authorizedPubkey = Keypair.generate().publicKey;
    const newAuthorizedPubkey = Keypair.generate().publicKey;
    const stakeAuthorizationType = StakeAuthorizationLayout.Withdrawer;
    const custodianPubkey = Keypair.generate().publicKey;
    const params = {
      stakePubkey,
      authorizedPubkey,
      newAuthorizedPubkey,
      stakeAuthorizationType,
      custodianPubkey,
    };
    const transaction = StakeProgram.authorize(params);
    expect(transaction.instructions).to.have.length(1);
    const [stakeInstruction] = transaction.instructions;
    expect(params).to.eql(StakeInstruction.decodeAuthorize(stakeInstruction));
  });

  it('authorizeWithSeed', () => {
    const stakePubkey = Keypair.generate().publicKey;
    const authorityBase = Keypair.generate().publicKey;
    const authoritySeed = 'test string';
    const authorityOwner = Keypair.generate().publicKey;
    const newAuthorizedPubkey = Keypair.generate().publicKey;
    const stakeAuthorizationType = StakeAuthorizationLayout.Staker;
    const params = {
      stakePubkey,
      authorityBase,
      authoritySeed,
      authorityOwner,
      newAuthorizedPubkey,
      stakeAuthorizationType,
    };
    const transaction = StakeProgram.authorizeWithSeed(params);
    expect(transaction.instructions).to.have.length(1);
    const [stakeInstruction] = transaction.instructions;
    expect(params).to.eql(
      StakeInstruction.decodeAuthorizeWithSeed(stakeInstruction),
    );
  });

  it('authorizeWithSeed with custodian', () => {
    const stakePubkey = Keypair.generate().publicKey;
    const authorityBase = Keypair.generate().publicKey;
    const authoritySeed = 'test string';
    const authorityOwner = Keypair.generate().publicKey;
    const newAuthorizedPubkey = Keypair.generate().publicKey;
    const stakeAuthorizationType = StakeAuthorizationLayout.Staker;
    const custodianPubkey = Keypair.generate().publicKey;
    const params = {
      stakePubkey,
      authorityBase,
      authoritySeed,
      authorityOwner,
      newAuthorizedPubkey,
      stakeAuthorizationType,
      custodianPubkey,
    };
    const transaction = StakeProgram.authorizeWithSeed(params);
    expect(transaction.instructions).to.have.length(1);
    const [stakeInstruction] = transaction.instructions;
    expect(params).to.eql(
      StakeInstruction.decodeAuthorizeWithSeed(stakeInstruction),
    );
  });

  it('split', () => {
    const stakePubkey = Keypair.generate().publicKey;
    const authorizedPubkey = Keypair.generate().publicKey;
    const splitStakePubkey = Keypair.generate().publicKey;
    const params = {
      stakePubkey,
      authorizedPubkey,
      splitStakePubkey,
      lamports: 123,
    };
    const transaction = StakeProgram.split(params);
    expect(transaction.instructions).to.have.length(2);
    const [systemInstruction, stakeInstruction] = transaction.instructions;
    const systemParams = {
      fromPubkey: authorizedPubkey,
      newAccountPubkey: splitStakePubkey,
      lamports: 0,
      space: StakeProgram.space,
      programId: StakeProgram.programId,
    };
    expect(systemParams).to.eql(
      SystemInstruction.decodeCreateAccount(systemInstruction),
    );
    expect(params).to.eql(StakeInstruction.decodeSplit(stakeInstruction));
  });

  it('splitWithSeed', async () => {
    const stakePubkey = Keypair.generate().publicKey;
    const authorizedPubkey = Keypair.generate().publicKey;
    const lamports = 123;
    const seed = 'test string';
    const basePubkey = Keypair.generate().publicKey;
    const splitStakePubkey = await PublicKey.createWithSeed(
      basePubkey,
      seed,
      StakeProgram.programId,
    );
    const transaction = StakeProgram.splitWithSeed({
      stakePubkey,
      authorizedPubkey,
      lamports,
      splitStakePubkey,
      basePubkey,
      seed,
    });
    expect(transaction.instructions).to.have.length(2);
    const [systemInstruction, stakeInstruction] = transaction.instructions;
    const systemParams = {
      accountPubkey: splitStakePubkey,
      basePubkey,
      seed,
      space: StakeProgram.space,
      programId: StakeProgram.programId,
    };
    expect(systemParams).to.eql(
      SystemInstruction.decodeAllocateWithSeed(systemInstruction),
    );
    const splitParams = {
      stakePubkey,
      authorizedPubkey,
      splitStakePubkey,
      lamports,
    };
    expect(splitParams).to.eql(StakeInstruction.decodeSplit(stakeInstruction));
  });

  it('merge', () => {
    const stakePubkey = Keypair.generate().publicKey;
    const sourceStakePubKey = Keypair.generate().publicKey;
    const authorizedPubkey = Keypair.generate().publicKey;
    const params = {
      stakePubkey,
      sourceStakePubKey,
      authorizedPubkey,
    };
    const transaction = StakeProgram.merge(params);
    expect(transaction.instructions).to.have.length(1);
    const [stakeInstruction] = transaction.instructions;
    expect(params).to.eql(StakeInstruction.decodeMerge(stakeInstruction));
  });

  it('withdraw', () => {
    const stakePubkey = Keypair.generate().publicKey;
    const authorizedPubkey = Keypair.generate().publicKey;
    const toPubkey = Keypair.generate().publicKey;
    const params = {
      stakePubkey,
      authorizedPubkey,
      toPubkey,
      lamports: 123,
    };
    const transaction = StakeProgram.withdraw(params);
    expect(transaction.instructions).to.have.length(1);
    const [stakeInstruction] = transaction.instructions;
    expect(params).to.eql(StakeInstruction.decodeWithdraw(stakeInstruction));
  });

  it('withdraw with custodian', () => {
    const stakePubkey = Keypair.generate().publicKey;
    const authorizedPubkey = Keypair.generate().publicKey;
    const toPubkey = Keypair.generate().publicKey;
    const custodianPubkey = Keypair.generate().publicKey;
    const params = {
      stakePubkey,
      authorizedPubkey,
      toPubkey,
      lamports: 123,
      custodianPubkey,
    };
    const transaction = StakeProgram.withdraw(params);
    expect(transaction.instructions).to.have.length(1);
    const [stakeInstruction] = transaction.instructions;
    expect(params).to.eql(StakeInstruction.decodeWithdraw(stakeInstruction));
  });

  it('deactivate', () => {
    const stakePubkey = Keypair.generate().publicKey;
    const authorizedPubkey = Keypair.generate().publicKey;
    const params = {stakePubkey, authorizedPubkey};
    const transaction = StakeProgram.deactivate(params);
    expect(transaction.instructions).to.have.length(1);
    const [stakeInstruction] = transaction.instructions;
    expect(params).to.eql(StakeInstruction.decodeDeactivate(stakeInstruction));
  });

  it('StakeInstructions', async () => {
    const from = Keypair.generate();
    const seed = 'test string';
    const newAccountPubkey = await PublicKey.createWithSeed(
      from.publicKey,
      seed,
      StakeProgram.programId,
    );
    const authorized = Keypair.generate();
    const amount = 123;
    const recentBlockhash = 'EETubP5AKHgjPAhzPAFcb8BAY1hMH639CWCFTqi3hq1k'; // Arbitrary known recentBlockhash
    const createWithSeed = StakeProgram.createAccountWithSeed({
      fromPubkey: from.publicKey,
      stakePubkey: newAccountPubkey,
      basePubkey: from.publicKey,
      seed,
      authorized: new Authorized(authorized.publicKey, authorized.publicKey),
      lockup: new Lockup(0, 0, from.publicKey),
      lamports: amount,
    });
    const createWithSeedTransaction = new Transaction({
      blockhash: recentBlockhash,
      lastValidBlockHeight: 9999,
    }).add(createWithSeed);

    expect(createWithSeedTransaction.instructions).to.have.length(2);
    const systemInstructionType = SystemInstruction.decodeInstructionType(
      createWithSeedTransaction.instructions[0],
    );
    expect(systemInstructionType).to.eq('CreateWithSeed');

    const stakeInstructionType = StakeInstruction.decodeInstructionType(
      createWithSeedTransaction.instructions[1],
    );
    expect(stakeInstructionType).to.eq('Initialize');

    expect(() => {
      StakeInstruction.decodeInstructionType(
        createWithSeedTransaction.instructions[0],
      );
    }).to.throw();

    const stake = Keypair.generate();
    const vote = Keypair.generate();
    const delegate = StakeProgram.delegate({
      stakePubkey: stake.publicKey,
      authorizedPubkey: authorized.publicKey,
      votePubkey: vote.publicKey,
    });

    const delegateTransaction = new Transaction({
      blockhash: recentBlockhash,
      lastValidBlockHeight: 9999,
    }).add(delegate);
    const anotherStakeInstructionType = StakeInstruction.decodeInstructionType(
      delegateTransaction.instructions[0],
    );
    expect(anotherStakeInstructionType).to.eq('Delegate');
  });
});
