import {expect, use} from 'chai';
import chaiAsPromised from 'chai-as-promised';

import {
  Keypair,
  VoteAuthorizationLayout,
  VoteInit,
  VoteInstruction,
  VoteProgram,
  SystemInstruction,
} from '../../src';

use(chaiAsPromised);

describe('VoteProgram', () => {
  it('createAccount', () => {
    const fromPubkey = Keypair.generate().publicKey;
    const newAccountPubkey = Keypair.generate().publicKey;
    const authorizedPubkey = Keypair.generate().publicKey;
    const nodePubkey = Keypair.generate().publicKey;
    const commission = 5;
    const voteInit = new VoteInit(
      nodePubkey,
      authorizedPubkey,
      authorizedPubkey,
      commission,
    );
    const lamports = 123;
    const transaction = VoteProgram.createAccount({
      fromPubkey,
      votePubkey: newAccountPubkey,
      voteInit,
      lamports,
    });
    expect(transaction.instructions).to.have.length(2);
    const [systemInstruction, voteInstruction] = transaction.instructions;
    const systemParams = {
      fromPubkey,
      newAccountPubkey,
      lamports,
      space: VoteProgram.space,
      programId: VoteProgram.programId,
    };
    expect(systemParams).to.eql(
      SystemInstruction.decodeCreateAccount(systemInstruction),
    );

    const initParams = {votePubkey: newAccountPubkey, nodePubkey, voteInit};
    expect(initParams).to.eql(
      VoteInstruction.decodeInitializeAccount(voteInstruction),
    );
  });

  it('initialize', () => {
    const newAccountPubkey = Keypair.generate().publicKey;
    const authorizedPubkey = Keypair.generate().publicKey;
    const nodePubkey = Keypair.generate().publicKey;
    const voteInit = new VoteInit(
      nodePubkey,
      authorizedPubkey,
      authorizedPubkey,
      5,
    );
    const initParams = {
      votePubkey: newAccountPubkey,
      nodePubkey,
      voteInit,
    };
    const initInstruction = VoteProgram.initializeAccount(initParams);
    expect(initParams).to.eql(
      VoteInstruction.decodeInitializeAccount(initInstruction),
    );
  });

  it('authorize', () => {
    const votePubkey = Keypair.generate().publicKey;
    const authorizedPubkey = Keypair.generate().publicKey;
    const newAuthorizedPubkey = Keypair.generate().publicKey;
    const voteAuthorizationType = VoteAuthorizationLayout.Voter;
    const params = {
      votePubkey,
      authorizedPubkey,
      newAuthorizedPubkey,
      voteAuthorizationType,
    };
    const transaction = VoteProgram.authorize(params);
    expect(transaction.instructions).to.have.length(1);
    const [authorizeInstruction] = transaction.instructions;
    expect(params).to.eql(
      VoteInstruction.decodeAuthorize(authorizeInstruction),
    );
  });

  it('authorize with seed', () => {
    const votePubkey = Keypair.generate().publicKey;
    const currentAuthorityDerivedKeyBasePubkey = Keypair.generate().publicKey;
    const currentAuthorityDerivedKeyOwnerPubkey = Keypair.generate().publicKey;
    const currentAuthorityDerivedKeySeed = 'sunflower';
    const newAuthorizedPubkey = Keypair.generate().publicKey;
    const voteAuthorizationType = VoteAuthorizationLayout.Voter;
    const params = {
      currentAuthorityDerivedKeyBasePubkey,
      currentAuthorityDerivedKeyOwnerPubkey,
      currentAuthorityDerivedKeySeed,
      newAuthorizedPubkey,
      voteAuthorizationType,
      votePubkey,
    };
    const transaction = VoteProgram.authorizeWithSeed(params);
    expect(transaction.instructions).to.have.length(1);
    const [authorizeWithSeedInstruction] = transaction.instructions;
    expect(params).to.eql(
      VoteInstruction.decodeAuthorizeWithSeed(authorizeWithSeedInstruction),
    );
  });

  it('withdraw', () => {
    const votePubkey = Keypair.generate().publicKey;
    const authorizedWithdrawerPubkey = Keypair.generate().publicKey;
    const toPubkey = Keypair.generate().publicKey;
    const params = {
      votePubkey,
      authorizedWithdrawerPubkey,
      lamports: 123,
      toPubkey,
    };
    const transaction = VoteProgram.withdraw(params);
    expect(transaction.instructions).to.have.length(1);
    const [withdrawInstruction] = transaction.instructions;
    expect(params).to.eql(VoteInstruction.decodeWithdraw(withdrawInstruction));
  });
});
