import {expect, use} from 'chai';
import chaiAsPromised from 'chai-as-promised';

import {
  LAMPORTS_PER_SOL,
  ComputeBudgetProgram,
  ComputeBudgetInstruction,
} from '../../src';

use(chaiAsPromised);

describe('ComputeBudgetProgram', () => {
  it('requestUnits', () => {
    const params = {
      units: 150000,
      additionalFee: LAMPORTS_PER_SOL,
    };
    const ix = ComputeBudgetProgram.requestUnits(params);
    const decodedParams = ComputeBudgetInstruction.decodeRequestUnits(ix);
    expect(params).to.eql(decodedParams);
    expect(ComputeBudgetInstruction.decodeInstructionType(ix)).to.eq(
      'RequestUnits',
    );
  });

  it('requestHeapFrame', () => {
    const params = {
      bytes: 33 * 1024,
    };
    const ix = ComputeBudgetProgram.requestHeapFrame(params);
    const decodedParams = ComputeBudgetInstruction.decodeRequestHeapFrame(ix);
    expect(decodedParams).to.eql(params);
    expect(ComputeBudgetInstruction.decodeInstructionType(ix)).to.eq(
      'RequestHeapFrame',
    );
  });

  it('setComputeUnitLimit', () => {
    const params = {
      units: 50_000,
    };
    const ix = ComputeBudgetProgram.setComputeUnitLimit(params);
    const decodedParams =
      ComputeBudgetInstruction.decodeSetComputeUnitLimit(ix);
    expect(decodedParams).to.eql(params);
    expect(ComputeBudgetInstruction.decodeInstructionType(ix)).to.eq(
      'SetComputeUnitLimit',
    );
  });

  it('setComputeUnitPrice', () => {
    const params = {
      microLamports: 100_000,
    };
    const ix = ComputeBudgetProgram.setComputeUnitPrice(params);
    const expectedParams = {
      ...params,
      microLamports: BigInt(params.microLamports),
    };
    const decodedParams =
      ComputeBudgetInstruction.decodeSetComputeUnitPrice(ix);
    expect(decodedParams).to.eql(expectedParams);
    expect(ComputeBudgetInstruction.decodeInstructionType(ix)).to.eq(
      'SetComputeUnitPrice',
    );
  });
});
