import {PACKET_DATA_SIZE} from './transaction';

// Keep program chunks under PACKET_DATA_SIZE, leaving enough room for the
// rest of the Transaction fields
//
// TODO: replace 300 with a proper constant for the size of the other
// Transaction fields
const CHUNK_SIZE = PACKET_DATA_SIZE - 300;

/**
 * Program loader interface
 */
export class Loader {
  /**
   * @internal
   */
  constructor() {}

  /**
   * Amount of program data placed in each load Transaction
   */
  static chunkSize: number = CHUNK_SIZE;

  /**
   * Minimum number of signatures required to load a program not including
   * retries
   *
   * Can be used to calculate transaction fees
   */
  static getMinNumSignatures(dataLength: number): number {
    return (
      2 * // Every transaction requires two signatures (payer + program)
      (Math.ceil(dataLength / Loader.chunkSize) +
        1 + // Add one for Create transaction
        1) // Add one for Finalize transaction
    );
  }
}
