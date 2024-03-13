/* eslint-disable no-dupe-class-members */

import {EpochSchedule} from './epoch-schedule';
import fetchImpl from './fetch-impl';
import {NonceAccount} from './nonce-account';
import {PublicKey} from './publickey';
import {Signer} from './keypair';
import {
  Transaction,
  TransactionVersion,
  VersionedTransaction,
} from './transaction';
import {Message, VersionedMessage} from './message';
import {AddressLookupTableAccount} from './programs/address-lookup-table/state';
import type {Blockhash} from './blockhash';
import type {FeeCalculator} from './fee-calculator';
import type {TransactionSignature} from './transaction';
import type {CompiledInstruction} from './message';

/**
 * Attempt to use a recent blockhash for up to 30 seconds
 * @internal
 */
export const BLOCKHASH_CACHE_TIMEOUT_MS = 30 * 1000;

type ClientSubscriptionId = number;

/**
 * @internal
 */
export type RpcParams = {
  methodName: string;
  args: Array<any>;
};

export type TokenAccountsFilter =
  | {
      mint: PublicKey;
    }
  | {
      programId: PublicKey;
    };

/**
 * Extra contextual information for RPC responses
 */
export type Context = {
  slot: number;
};

/**
 * Options for sending transactions
 */
export type SendOptions = {
  /** disable transaction verification step */
  skipPreflight?: boolean;
  /** preflight commitment level */
  preflightCommitment?: Commitment;
  /** Maximum number of times for the RPC node to retry sending the transaction to the leader. */
  maxRetries?: number;
  /** The minimum slot that the request can be evaluated at */
  minContextSlot?: number;
};

/**
 * Options for confirming transactions
 */
export type ConfirmOptions = {
  /** disable transaction verification step */
  skipPreflight?: boolean;
  /** desired commitment level */
  commitment?: Commitment;
  /** preflight commitment level */
  preflightCommitment?: Commitment;
  /** Maximum number of times for the RPC node to retry sending the transaction to the leader. */
  maxRetries?: number;
  /** The minimum slot that the request can be evaluated at */
  minContextSlot?: number;
};

/**
 * Options for getConfirmedSignaturesForAddress2
 */
export type ConfirmedSignaturesForAddress2Options = {
  /**
   * Start searching backwards from this transaction signature.
   * @remark If not provided the search starts from the highest max confirmed block.
   */
  before?: TransactionSignature;
  /** Search until this transaction signature is reached, if found before `limit`. */
  until?: TransactionSignature;
  /** Maximum transaction signatures to return (between 1 and 1,000, default: 1,000). */
  limit?: number;
};

/**
 * Options for getSignaturesForAddress
 */
export type SignaturesForAddressOptions = {
  /**
   * Start searching backwards from this transaction signature.
   * @remark If not provided the search starts from the highest max confirmed block.
   */
  before?: TransactionSignature;
  /** Search until this transaction signature is reached, if found before `limit`. */
  until?: TransactionSignature;
  /** Maximum transaction signatures to return (between 1 and 1,000, default: 1,000). */
  limit?: number;
  /** The minimum slot that the request can be evaluated at */
  minContextSlot?: number;
};

/**
 * RPC Response with extra contextual information
 */
export type RpcResponseAndContext<T> = {
  /** response context */
  context: Context;
  /** response value */
  value: T;
};

export type BlockhashWithExpiryBlockHeight = Readonly<{
  blockhash: Blockhash;
  lastValidBlockHeight: number;
}>;

/**
 * A strategy for confirming transactions that uses the last valid
 * block height for a given blockhash to check for transaction expiration.
 */
export type BlockheightBasedTransactionConfirmationStrategy = {
  signature: TransactionSignature;
} & BlockhashWithExpiryBlockHeight;

/**
 * The level of commitment desired when querying state
 * <pre>
 *   'processed': Query the most recent block which has reached 1 confirmation by the connected node
 *   'confirmed': Query the most recent block which has reached 1 confirmation by the cluster
 *   'finalized': Query the most recent block which has been finalized by the cluster
 * </pre>
 */
export type Commitment =
  | 'processed'
  | 'confirmed'
  | 'finalized'
  | 'recent' // Deprecated as of v1.5.5
  | 'single' // Deprecated as of v1.5.5
  | 'singleGossip' // Deprecated as of v1.5.5
  | 'root' // Deprecated as of v1.5.5
  | 'max'; // Deprecated as of v1.5.5

/**
 * A subset of Commitment levels, which are at least optimistically confirmed
 * <pre>
 *   'confirmed': Query the most recent block which has reached 1 confirmation by the cluster
 *   'finalized': Query the most recent block which has been finalized by the cluster
 * </pre>
 */
export type Finality = 'confirmed' | 'finalized';

/**
 * Filter for largest accounts query
 * <pre>
 *   'circulating':    Return the largest accounts that are part of the circulating supply
 *   'nonCirculating': Return the largest accounts that are not part of the circulating supply
 * </pre>
 */
export type LargestAccountsFilter = 'circulating' | 'nonCirculating';

/**
 * Configuration object for changing `getAccountInfo` query behavior
 */
export type GetAccountInfoConfig = {
  /** The level of commitment desired */
  commitment?: Commitment;
  /** The minimum slot that the request can be evaluated at */
  minContextSlot?: number;
};

/**
 * Configuration object for changing `getBalance` query behavior
 */
export type GetBalanceConfig = {
  /** The level of commitment desired */
  commitment?: Commitment;
  /** The minimum slot that the request can be evaluated at */
  minContextSlot?: number;
};

/**
 * Configuration object for changing `getBlock` query behavior
 */
export type GetBlockConfig = {
  /** The level of finality desired */
  commitment?: Finality;
};

/**
 * Configuration object for changing `getBlock` query behavior
 */
export type GetVersionedBlockConfig = {
  /** The level of finality desired */
  commitment?: Finality;
  /** The max transaction version to return in responses. If the requested transaction is a higher version, an error will be returned */
  maxSupportedTransactionVersion?: number;
};

/**
 * Configuration object for changing `getStakeMinimumDelegation` query behavior
 */
export type GetStakeMinimumDelegationConfig = {
  /** The level of commitment desired */
  commitment?: Commitment;
};

/**
 * Configuration object for changing `getBlockHeight` query behavior
 */
export type GetBlockHeightConfig = {
  /** The level of commitment desired */
  commitment?: Commitment;
  /** The minimum slot that the request can be evaluated at */
  minContextSlot?: number;
};

/**
 * Configuration object for changing `getEpochInfo` query behavior
 */
export type GetEpochInfoConfig = {
  /** The level of commitment desired */
  commitment?: Commitment;
  /** The minimum slot that the request can be evaluated at */
  minContextSlot?: number;
};

/**
 * Configuration object for changing `getInflationReward` query behavior
 */
export type GetInflationRewardConfig = {
  /** The level of commitment desired */
  commitment?: Commitment;
  /** An epoch for which the reward occurs. If omitted, the previous epoch will be used */
  epoch?: number;
  /** The minimum slot that the request can be evaluated at */
  minContextSlot?: number;
};

/**
 * Configuration object for changing `getLatestBlockhash` query behavior
 */
export type GetLatestBlockhashConfig = {
  /** The level of commitment desired */
  commitment?: Commitment;
  /** The minimum slot that the request can be evaluated at */
  minContextSlot?: number;
};

/**
 * Configuration object for changing `getSlot` query behavior
 */
export type GetSlotConfig = {
  /** The level of commitment desired */
  commitment?: Commitment;
  /** The minimum slot that the request can be evaluated at */
  minContextSlot?: number;
};

/**
 * Configuration object for changing `getSlotLeader` query behavior
 */
export type GetSlotLeaderConfig = {
  /** The level of commitment desired */
  commitment?: Commitment;
  /** The minimum slot that the request can be evaluated at */
  minContextSlot?: number;
};

/**
 * Configuration object for changing `getTransaction` query behavior
 */
export type GetTransactionConfig = {
  /** The level of finality desired */
  commitment?: Finality;
};

/**
 * Configuration object for changing `getTransaction` query behavior
 */
export type GetVersionedTransactionConfig = {
  /** The level of finality desired */
  commitment?: Finality;
  /** The max transaction version to return in responses. If the requested transaction is a higher version, an error will be returned */
  maxSupportedTransactionVersion?: number;
};

/**
 * Configuration object for changing `getLargestAccounts` query behavior
 */
export type GetLargestAccountsConfig = {
  /** The level of commitment desired */
  commitment?: Commitment;
  /** Filter largest accounts by whether they are part of the circulating supply */
  filter?: LargestAccountsFilter;
};

/**
 * Configuration object for changing `getSupply` request behavior
 */
export type GetSupplyConfig = {
  /** The level of commitment desired */
  commitment?: Commitment;
  /** Exclude non circulating accounts list from response */
  excludeNonCirculatingAccountsList?: boolean;
};

/**
 * Configuration object for changing query behavior
 */
export type SignatureStatusConfig = {
  /** enable searching status history, not needed for recent transactions */
  searchTransactionHistory: boolean;
};

/**
 * Information describing a cluster node
 */
export type ContactInfo = {
  /** Identity public key of the node */
  pubkey: string;
  /** Gossip network address for the node */
  gossip: string | null;
  /** TPU network address for the node (null if not available) */
  tpu: string | null;
  /** JSON RPC network address for the node (null if not available) */
  rpc: string | null;
  /** Software version of the node (null if not available) */
  version: string | null;
};

/**
 * Information describing a vote account
 */
export type VoteAccountInfo = {
  /** Public key of the vote account */
  votePubkey: string;
  /** Identity public key of the node voting with this account */
  nodePubkey: string;
  /** The stake, in lamports, delegated to this vote account and activated */
  activatedStake: number;
  /** Whether the vote account is staked for this epoch */
  epochVoteAccount: boolean;
  /** Recent epoch voting credit history for this voter */
  epochCredits: Array<[number, number, number]>;
  /** A percentage (0-100) of rewards payout owed to the voter */
  commission: number;
  /** Most recent slot voted on by this vote account */
  lastVote: number;
};

/**
 * A collection of cluster vote accounts
 */
export type VoteAccountStatus = {
  /** Active vote accounts */
  current: Array<VoteAccountInfo>;
  /** Inactive vote accounts */
  delinquent: Array<VoteAccountInfo>;
};

/**
 * Network Inflation
 * (see https://docs.solana.com/implemented-proposals/ed_overview)
 */
export type InflationGovernor = {
  foundation: number;
  foundationTerm: number;
  initial: number;
  taper: number;
  terminal: number;
};

/**
 * The inflation reward for an epoch
 */
export type InflationReward = {
  /** epoch for which the reward occurs */
  epoch: number;
  /** the slot in which the rewards are effective */
  effectiveSlot: number;
  /** reward amount in lamports */
  amount: number;
  /** post balance of the account in lamports */
  postBalance: number;
};

/**
 * Information about the current epoch
 */
export type EpochInfo = {
  epoch: number;
  slotIndex: number;
  slotsInEpoch: number;
  absoluteSlot: number;
  blockHeight?: number;
  transactionCount?: number;
};

/**
 * Leader schedule
 * (see https://docs.solana.com/terminology#leader-schedule)
 */
export type LeaderSchedule = {
  [address: string]: number[];
};

/**
 * Version info for a node
 */
export type Version = {
  /** Version of solana-core */
  'solana-core': string;
  'feature-set'?: number;
};

export type SimulatedTransactionAccountInfo = {
  /** `true` if this account's data contains a loaded program */
  executable: boolean;
  /** Identifier of the program that owns the account */
  owner: string;
  /** Number of lamports assigned to the account */
  lamports: number;
  /** Optional data assigned to the account */
  data: string[];
  /** Optional rent epoch info for account */
  rentEpoch?: number;
};

export type TransactionReturnDataEncoding = 'base64';

export type TransactionReturnData = {
  programId: string;
  data: [string, TransactionReturnDataEncoding];
};

export type SimulateTransactionConfig = {
  /** Optional parameter used to enable signature verification before simulation */
  sigVerify?: boolean;
  /** Optional parameter used to replace the simulated transaction's recent blockhash with the latest blockhash */
  replaceRecentBlockhash?: boolean;
  /** Optional parameter used to set the commitment level when selecting the latest block */
  commitment?: Commitment;
  /** Optional parameter used to specify a list of account addresses to return post simulation state for */
  accounts?: {
    encoding: 'base64';
    addresses: string[];
  };
  /** Optional parameter used to specify the minimum block slot that can be used for simulation */
  minContextSlot?: number;
};

export type SimulatedTransactionResponse = {
  err: TransactionError | string | null;
  logs: Array<string> | null;
  accounts?: (SimulatedTransactionAccountInfo | null)[] | null;
  unitsConsumed?: number;
  returnData?: TransactionReturnData | null;
};

export type ParsedInnerInstruction = {
  index: number;
  instructions: (ParsedInstruction | PartiallyDecodedInstruction)[];
};

export type TokenBalance = {
  accountIndex: number;
  mint: string;
  owner?: string;
  uiTokenAmount: TokenAmount;
};

/**
 * Metadata for a parsed confirmed transaction on the ledger
 *
 * @deprecated Deprecated since Solana v1.8.0. Please use {@link ParsedTransactionMeta} instead.
 */
export type ParsedConfirmedTransactionMeta = ParsedTransactionMeta;

/**
 * Collection of addresses loaded by a transaction using address table lookups
 */
export type LoadedAddresses = {
  writable: Array<PublicKey>;
  readonly: Array<PublicKey>;
};

/**
 * Metadata for a parsed transaction on the ledger
 */
export type ParsedTransactionMeta = {
  /** The fee charged for processing the transaction */
  fee: number;
  /** An array of cross program invoked parsed instructions */
  innerInstructions?: ParsedInnerInstruction[] | null;
  /** The balances of the transaction accounts before processing */
  preBalances: Array<number>;
  /** The balances of the transaction accounts after processing */
  postBalances: Array<number>;
  /** An array of program log messages emitted during a transaction */
  logMessages?: Array<string> | null;
  /** The token balances of the transaction accounts before processing */
  preTokenBalances?: Array<TokenBalance> | null;
  /** The token balances of the transaction accounts after processing */
  postTokenBalances?: Array<TokenBalance> | null;
  /** The error result of transaction processing */
  err: TransactionError | null;
  /** The collection of addresses loaded using address lookup tables */
  loadedAddresses?: LoadedAddresses;
  /** The compute units consumed after processing the transaction */
  computeUnitsConsumed?: number;
};

export type CompiledInnerInstruction = {
  index: number;
  instructions: CompiledInstruction[];
};

/**
 * Metadata for a confirmed transaction on the ledger
 */
export type ConfirmedTransactionMeta = {
  /** The fee charged for processing the transaction */
  fee: number;
  /** An array of cross program invoked instructions */
  innerInstructions?: CompiledInnerInstruction[] | null;
  /** The balances of the transaction accounts before processing */
  preBalances: Array<number>;
  /** The balances of the transaction accounts after processing */
  postBalances: Array<number>;
  /** An array of program log messages emitted during a transaction */
  logMessages?: Array<string> | null;
  /** The token balances of the transaction accounts before processing */
  preTokenBalances?: Array<TokenBalance> | null;
  /** The token balances of the transaction accounts after processing */
  postTokenBalances?: Array<TokenBalance> | null;
  /** The error result of transaction processing */
  err: TransactionError | null;
  /** The collection of addresses loaded using address lookup tables */
  loadedAddresses?: LoadedAddresses;
  /** The compute units consumed after processing the transaction */
  computeUnitsConsumed?: number;
};

/**
 * A processed transaction from the RPC API
 */
export type TransactionResponse = {
  /** The slot during which the transaction was processed */
  slot: number;
  /** The transaction */
  transaction: {
    /** The transaction message */
    message: Message;
    /** The transaction signatures */
    signatures: string[];
  };
  /** Metadata produced from the transaction */
  meta: ConfirmedTransactionMeta | null;
  /** The unix timestamp of when the transaction was processed */
  blockTime?: number | null;
};

/**
 * A processed transaction from the RPC API
 */
export type VersionedTransactionResponse = {
  /** The slot during which the transaction was processed */
  slot: number;
  /** The transaction */
  transaction: {
    /** The transaction message */
    message: VersionedMessage;
    /** The transaction signatures */
    signatures: string[];
  };
  /** Metadata produced from the transaction */
  meta: ConfirmedTransactionMeta | null;
  /** The unix timestamp of when the transaction was processed */
  blockTime?: number | null;
  /** The transaction version */
  version?: TransactionVersion;
};

/**
 * A confirmed transaction on the ledger
 *
 * @deprecated Deprecated since Solana v1.8.0.
 */
export type ConfirmedTransaction = {
  /** The slot during which the transaction was processed */
  slot: number;
  /** The details of the transaction */
  transaction: Transaction;
  /** Metadata produced from the transaction */
  meta: ConfirmedTransactionMeta | null;
  /** The unix timestamp of when the transaction was processed */
  blockTime?: number | null;
};

/**
 * A partially decoded transaction instruction
 */
export type PartiallyDecodedInstruction = {
  /** Program id called by this instruction */
  programId: PublicKey;
  /** Public keys of accounts passed to this instruction */
  accounts: Array<PublicKey>;
  /** Raw base-58 instruction data */
  data: string;
};

/**
 * A parsed transaction message account
 */
export type ParsedMessageAccount = {
  /** Public key of the account */
  pubkey: PublicKey;
  /** Indicates if the account signed the transaction */
  signer: boolean;
  /** Indicates if the account is writable for this transaction */
  writable: boolean;
  /** Indicates if the account key came from the transaction or a lookup table */
  source?: 'transaction' | 'lookupTable';
};

/**
 * A parsed transaction instruction
 */
export type ParsedInstruction = {
  /** Name of the program for this instruction */
  program: string;
  /** ID of the program for this instruction */
  programId: PublicKey;
  /** Parsed instruction info */
  parsed: any;
};

/**
 * A parsed address table lookup
 */
export type ParsedAddressTableLookup = {
  /** Address lookup table account key */
  accountKey: PublicKey;
  /** Parsed instruction info */
  writableIndexes: number[];
  /** Parsed instruction info */
  readonlyIndexes: number[];
};

/**
 * A parsed transaction message
 */
export type ParsedMessage = {
  /** Accounts used in the instructions */
  accountKeys: ParsedMessageAccount[];
  /** The atomically executed instructions for the transaction */
  instructions: (ParsedInstruction | PartiallyDecodedInstruction)[];
  /** Recent blockhash */
  recentBlockhash: string;
  /** Address table lookups used to load additional accounts */
  addressTableLookups?: ParsedAddressTableLookup[] | null;
};

/**
 * A parsed transaction
 */
export type ParsedTransaction = {
  /** Signatures for the transaction */
  signatures: Array<string>;
  /** Message of the transaction */
  message: ParsedMessage;
};

/**
 * A parsed and confirmed transaction on the ledger
 *
 * @deprecated Deprecated since Solana v1.8.0. Please use {@link ParsedTransactionWithMeta} instead.
 */
export type ParsedConfirmedTransaction = ParsedTransactionWithMeta;

/**
 * A parsed transaction on the ledger with meta
 */
export type ParsedTransactionWithMeta = {
  /** The slot during which the transaction was processed */
  slot: number;
  /** The details of the transaction */
  transaction: ParsedTransaction;
  /** Metadata produced from the transaction */
  meta: ParsedTransactionMeta | null;
  /** The unix timestamp of when the transaction was processed */
  blockTime?: number | null;
  /** The version of the transaction message */
  version?: TransactionVersion;
};

/**
 * A processed block fetched from the RPC API
 */
export type BlockResponse = {
  /** Blockhash of this block */
  blockhash: Blockhash;
  /** Blockhash of this block's parent */
  previousBlockhash: Blockhash;
  /** Slot index of this block's parent */
  parentSlot: number;
  /** Vector of transactions with status meta and original message */
  transactions: Array<{
    /** The transaction */
    transaction: {
      /** The transaction message */
      message: Message;
      /** The transaction signatures */
      signatures: string[];
    };
    /** Metadata produced from the transaction */
    meta: ConfirmedTransactionMeta | null;
    /** The transaction version */
    version?: TransactionVersion;
  }>;
  /** Vector of block rewards */
  rewards?: Array<{
    /** Public key of reward recipient */
    pubkey: string;
    /** Reward value in lamports */
    lamports: number;
    /** Account balance after reward is applied */
    postBalance: number | null;
    /** Type of reward received */
    rewardType: string | null;
  }>;
  /** The unix timestamp of when the block was processed */
  blockTime: number | null;
};

/**
 * A processed block fetched from the RPC API
 */
export type VersionedBlockResponse = {
  /** Blockhash of this block */
  blockhash: Blockhash;
  /** Blockhash of this block's parent */
  previousBlockhash: Blockhash;
  /** Slot index of this block's parent */
  parentSlot: number;
  /** Vector of transactions with status meta and original message */
  transactions: Array<{
    /** The transaction */
    transaction: {
      /** The transaction message */
      message: VersionedMessage;
      /** The transaction signatures */
      signatures: string[];
    };
    /** Metadata produced from the transaction */
    meta: ConfirmedTransactionMeta | null;
    /** The transaction version */
    version?: TransactionVersion;
  }>;
  /** Vector of block rewards */
  rewards?: Array<{
    /** Public key of reward recipient */
    pubkey: string;
    /** Reward value in lamports */
    lamports: number;
    /** Account balance after reward is applied */
    postBalance: number | null;
    /** Type of reward received */
    rewardType: string | null;
  }>;
  /** The unix timestamp of when the block was processed */
  blockTime: number | null;
};

/**
 * A confirmed block on the ledger
 *
 * @deprecated Deprecated since Solana v1.8.0.
 */
export type ConfirmedBlock = {
  /** Blockhash of this block */
  blockhash: Blockhash;
  /** Blockhash of this block's parent */
  previousBlockhash: Blockhash;
  /** Slot index of this block's parent */
  parentSlot: number;
  /** Vector of transactions and status metas */
  transactions: Array<{
    transaction: Transaction;
    meta: ConfirmedTransactionMeta | null;
  }>;
  /** Vector of block rewards */
  rewards?: Array<{
    pubkey: string;
    lamports: number;
    postBalance: number | null;
    rewardType: string | null;
  }>;
  /** The unix timestamp of when the block was processed */
  blockTime: number | null;
};

/**
 * A Block on the ledger with signatures only
 */
export type BlockSignatures = {
  /** Blockhash of this block */
  blockhash: Blockhash;
  /** Blockhash of this block's parent */
  previousBlockhash: Blockhash;
  /** Slot index of this block's parent */
  parentSlot: number;
  /** Vector of signatures */
  signatures: Array<string>;
  /** The unix timestamp of when the block was processed */
  blockTime: number | null;
};

/**
 * recent block production information
 */
export type BlockProduction = Readonly<{
  /** a dictionary of validator identities, as base-58 encoded strings. Value is a two element array containing the number of leader slots and the number of blocks produced */
  byIdentity: Readonly<Record<string, ReadonlyArray<number>>>;
  /** Block production slot range */
  range: Readonly<{
    /** first slot of the block production information (inclusive) */
    firstSlot: number;
    /** last slot of block production information (inclusive) */
    lastSlot: number;
  }>;
}>;

export type GetBlockProductionConfig = {
  /** Optional commitment level */
  commitment?: Commitment;
  /** Slot range to return block production for. If parameter not provided, defaults to current epoch. */
  range?: {
    /** first slot to return block production information for (inclusive) */
    firstSlot: number;
    /** last slot to return block production information for (inclusive). If parameter not provided, defaults to the highest slot */
    lastSlot?: number;
  };
  /** Only return results for this validator identity (base-58 encoded) */
  identity?: string;
};

/**
 * A performance sample
 */
export type PerfSample = {
  /** Slot number of sample */
  slot: number;
  /** Number of transactions in a sample window */
  numTransactions: number;
  /** Number of slots in a sample window */
  numSlots: number;
  /** Sample window in seconds */
  samplePeriodSecs: number;
};

/**
 * Supply
 */
export type Supply = {
  /** Total supply in lamports */
  total: number;
  /** Circulating supply in lamports */
  circulating: number;
  /** Non-circulating supply in lamports */
  nonCirculating: number;
  /** List of non-circulating account addresses */
  nonCirculatingAccounts: Array<PublicKey>;
};

/**
 * Token amount object which returns a token amount in different formats
 * for various client use cases.
 */
export type TokenAmount = {
  /** Raw amount of tokens as string ignoring decimals */
  amount: string;
  /** Number of decimals configured for token's mint */
  decimals: number;
  /** Token amount as float, accounts for decimals */
  uiAmount: number | null;
  /** Token amount as string, accounts for decimals */
  uiAmountString?: string;
};

/**
 * Token address and balance.
 */
export type TokenAccountBalancePair = {
  /** Address of the token account */
  address: PublicKey;
  /** Raw amount of tokens as string ignoring decimals */
  amount: string;
  /** Number of decimals configured for token's mint */
  decimals: number;
  /** Token amount as float, accounts for decimals */
  uiAmount: number | null;
  /** Token amount as string, accounts for decimals */
  uiAmountString?: string;
};

/**
 * Pair of an account address and its balance
 */
export type AccountBalancePair = {
  address: PublicKey;
  lamports: number;
};

/**
 * Slot updates which can be used for tracking the live progress of a cluster.
 * - `"firstShredReceived"`: connected node received the first shred of a block.
 * Indicates that a new block that is being produced.
 * - `"completed"`: connected node has received all shreds of a block. Indicates
 * a block was recently produced.
 * - `"optimisticConfirmation"`: block was optimistically confirmed by the
 * cluster. It is not guaranteed that an optimistic confirmation notification
 * will be sent for every finalized blocks.
 * - `"root"`: the connected node rooted this block.
 * - `"createdBank"`: the connected node has started validating this block.
 * - `"frozen"`: the connected node has validated this block.
 * - `"dead"`: the connected node failed to validate this block.
 */
export type SlotUpdate =
  | {
      type: 'firstShredReceived';
      slot: number;
      timestamp: number;
    }
  | {
      type: 'completed';
      slot: number;
      timestamp: number;
    }
  | {
      type: 'createdBank';
      slot: number;
      timestamp: number;
      parent: number;
    }
  | {
      type: 'frozen';
      slot: number;
      timestamp: number;
      stats: {
        numTransactionEntries: number;
        numSuccessfulTransactions: number;
        numFailedTransactions: number;
        maxTransactionsPerEntry: number;
      };
    }
  | {
      type: 'dead';
      slot: number;
      timestamp: number;
      err: string;
    }
  | {
      type: 'optimisticConfirmation';
      slot: number;
      timestamp: number;
    }
  | {
      type: 'root';
      slot: number;
      timestamp: number;
    };

/**
 * Information about the latest slot being processed by a node
 */
export type SlotInfo = {
  /** Currently processing slot */
  slot: number;
  /** Parent of the current slot */
  parent: number;
  /** The root block of the current slot's fork */
  root: number;
};

/**
 * Parsed account data
 */
export type ParsedAccountData = {
  /** Name of the program that owns this account */
  program: string;
  /** Parsed account data */
  parsed: any;
  /** Space used by account data */
  space: number;
};

/**
 * Stake Activation data
 */
export type StakeActivationData = {
  /** the stake account's activation state */
  state: 'active' | 'inactive' | 'activating' | 'deactivating';
  /** stake active during the epoch */
  active: number;
  /** stake inactive during the epoch */
  inactive: number;
};

/**
 * Data slice argument for getProgramAccounts
 */
export type DataSlice = {
  /** offset of data slice */
  offset: number;
  /** length of data slice */
  length: number;
};

/**
 * Memory comparison filter for getProgramAccounts
 */
export type MemcmpFilter = {
  memcmp: {
    /** offset into program account data to start comparison */
    offset: number;
    /** data to match, as base-58 encoded string and limited to less than 129 bytes */
    bytes: string;
  };
};

/**
 * Data size comparison filter for getProgramAccounts
 */
export type DataSizeFilter = {
  /** Size of data for program account data length comparison */
  dataSize: number;
};

/**
 * A filter object for getProgramAccounts
 */
export type GetProgramAccountsFilter = MemcmpFilter | DataSizeFilter;

/**
 * Configuration object for getProgramAccounts requests
 */
export type GetProgramAccountsConfig = {
  /** Optional commitment level */
  commitment?: Commitment;
  /** Optional encoding for account data (default base64)
   * To use "jsonParsed" encoding, please refer to `getParsedProgramAccounts` in connection.ts
   * */
  encoding?: 'base64';
  /** Optional data slice to limit the returned account data */
  dataSlice?: DataSlice;
  /** Optional array of filters to apply to accounts */
  filters?: GetProgramAccountsFilter[];
  /** The minimum slot that the request can be evaluated at */
  minContextSlot?: number;
};

/**
 * Configuration object for getParsedProgramAccounts
 */
export type GetParsedProgramAccountsConfig = {
  /** Optional commitment level */
  commitment?: Commitment;
  /** Optional array of filters to apply to accounts */
  filters?: GetProgramAccountsFilter[];
  /** The minimum slot that the request can be evaluated at */
  minContextSlot?: number;
};

/**
 * Configuration object for getMultipleAccounts
 */
export type GetMultipleAccountsConfig = {
  /** Optional commitment level */
  commitment?: Commitment;
  /** The minimum slot that the request can be evaluated at */
  minContextSlot?: number;
};

/**
 * Configuration object for `getStakeActivation`
 */
export type GetStakeActivationConfig = {
  /** Optional commitment level */
  commitment?: Commitment;
  /** Epoch for which to calculate activation details. If parameter not provided, defaults to current epoch */
  epoch?: number;
  /** The minimum slot that the request can be evaluated at */
  minContextSlot?: number;
};

/**
 * Configuration object for `getStakeActivation`
 */
export type GetTokenAccountsByOwnerConfig = {
  /** Optional commitment level */
  commitment?: Commitment;
  /** The minimum slot that the request can be evaluated at */
  minContextSlot?: number;
};

/**
 * Configuration object for `getStakeActivation`
 */
export type GetTransactionCountConfig = {
  /** Optional commitment level */
  commitment?: Commitment;
  /** The minimum slot that the request can be evaluated at */
  minContextSlot?: number;
};

/**
 * Information describing an account
 */
export type AccountInfo<T> = {
  /** `true` if this account's data contains a loaded program */
  executable: boolean;
  /** Identifier of the program that owns the account */
  owner: PublicKey;
  /** Number of lamports assigned to the account */
  lamports: number;
  /** Optional data assigned to the account */
  data: T;
  /** Optional rent epoch info for account */
  rentEpoch?: number;
};

/**
 * Account information identified by pubkey
 */
export type KeyedAccountInfo = {
  accountId: PublicKey;
  accountInfo: AccountInfo<Buffer>;
};

/**
 * Callback function for account change notifications
 */
export type AccountChangeCallback = (
  accountInfo: AccountInfo<Buffer>,
  context: Context,
) => void;

/**
 * Callback function for program account change notifications
 */
export type ProgramAccountChangeCallback = (
  keyedAccountInfo: KeyedAccountInfo,
  context: Context,
) => void;

/**
 * Callback function for slot change notifications
 */
export type SlotChangeCallback = (slotInfo: SlotInfo) => void;

/**
 * Callback function for slot update notifications
 */
export type SlotUpdateCallback = (slotUpdate: SlotUpdate) => void;

/**
 * Callback function for signature status notifications
 */
export type SignatureResultCallback = (
  signatureResult: SignatureResult,
  context: Context,
) => void;

/**
 * Signature status notification with transaction result
 */
export type SignatureStatusNotification = {
  type: 'status';
  result: SignatureResult;
};

/**
 * Signature received notification
 */
export type SignatureReceivedNotification = {
  type: 'received';
};

/**
 * Callback function for signature notifications
 */
export type SignatureSubscriptionCallback = (
  notification: SignatureStatusNotification | SignatureReceivedNotification,
  context: Context,
) => void;

/**
 * Signature subscription options
 */
export type SignatureSubscriptionOptions = {
  commitment?: Commitment;
  enableReceivedNotification?: boolean;
};

/**
 * Callback function for root change notifications
 */
export type RootChangeCallback = (root: number) => void;

/**
 * Logs result.
 */
export type Logs = {
  err: TransactionError | null;
  logs: string[];
  signature: string;
};

/**
 * Filter for log subscriptions.
 */
export type LogsFilter = PublicKey | 'all' | 'allWithVotes';

/**
 * Callback function for log notifications.
 */
export type LogsCallback = (logs: Logs, ctx: Context) => void;

/**
 * Signature result
 */
export type SignatureResult = {
  err: TransactionError | null;
};

/**
 * Transaction error
 */
export type TransactionError = {} | string;

/**
 * Transaction confirmation status
 * <pre>
 *   'processed': Transaction landed in a block which has reached 1 confirmation by the connected node
 *   'confirmed': Transaction landed in a block which has reached 1 confirmation by the cluster
 *   'finalized': Transaction landed in a block which has been finalized by the cluster
 * </pre>
 */
export type TransactionConfirmationStatus =
  | 'processed'
  | 'confirmed'
  | 'finalized';

/**
 * Signature status
 */
export type SignatureStatus = {
  /** when the transaction was processed */
  slot: number;
  /** the number of blocks that have been confirmed and voted on in the fork containing `slot` */
  confirmations: number | null;
  /** transaction error, if any */
  err: TransactionError | null;
  /** cluster confirmation status, if data available. Possible responses: `processed`, `confirmed`, `finalized` */
  confirmationStatus?: TransactionConfirmationStatus;
};

/**
 * A confirmed signature with its status
 */
export type ConfirmedSignatureInfo = {
  /** the transaction signature */
  signature: string;
  /** when the transaction was processed */
  slot: number;
  /** error, if any */
  err: TransactionError | null;
  /** memo associated with the transaction, if any */
  memo: string | null;
  /** The unix timestamp of when the transaction was processed */
  blockTime?: number | null;
};

/**
 * An object defining headers to be passed to the RPC server
 */
export type HttpHeaders = {
  [header: string]: string;
} & {
  // Prohibited headers; for internal use only.
  'solana-client'?: never;
};

/**
 * The type of the JavaScript `fetch()` API
 */
export type FetchFn = typeof fetchImpl;

/**
 * A callback used to augment the outgoing HTTP request
 */
export type FetchMiddleware = (
  info: Parameters<FetchFn>[0],
  init: Parameters<FetchFn>[1],
  fetch: (...a: Parameters<FetchFn>) => void,
) => void;

/**
 * Configuration for instantiating a Connection
 */
export type ConnectionConfig = {
  /** Optional commitment level */
  commitment?: Commitment;
  /** Optional endpoint URL to the fullnode JSON RPC PubSub WebSocket Endpoint */
  wsEndpoint?: string;
  /** Optional HTTP headers object */
  httpHeaders?: HttpHeaders;
  /** Optional custom fetch function */
  fetch?: FetchFn;
  /** Optional fetch middleware callback */
  fetchMiddleware?: FetchMiddleware;
  /** Optional Disable retrying calls when server responds with HTTP 429 (Too Many Requests) */
  disableRetryOnRateLimit?: boolean;
  /** time to allow for the server to initially process a transaction (in milliseconds) */
  confirmTransactionInitialTimeout?: number;
};

/**
 * A connection to a fullnode JSON RPC endpoint
 */
export declare class Connection {
  /** @internal */ _rpcEndpoint: string;

  /**
   * Establish a JSON RPC connection
   *
   * @param endpoint URL to the fullnode JSON RPC endpoint
   * @param commitmentOrConfig optional default commitment level or optional ConnectionConfig configuration object
   */
  constructor(
    _endpoint: string,
    _commitmentOrConfig?: Commitment | ConnectionConfig,
  );
  /**
   * The default commitment used for requests
   */
  get commitment(): Commitment | undefined;
  /**
   * The RPC endpoint
   */
  get rpcEndpoint(): string;
  /**
   * Fetch the balance for the specified public key, return with context
   */
  getBalanceAndContext(
    _publicKey: PublicKey,
    _commitmentOrConfig?: Commitment | GetBalanceConfig,
  ): Promise<RpcResponseAndContext<number>>;
  /**
   * Fetch the balance for the specified public key
   */
  getBalance(
    _publicKey: PublicKey,
    _commitmentOrConfig?: Commitment | GetBalanceConfig,
  ): Promise<number>;
  /**
   * Fetch the estimated production time of a block
   */
  getBlockTime(_slot: number): Promise<number | null>;
  /**
   * Fetch the lowest slot that the node has information about in its ledger.
   * This value may increase over time if the node is configured to purge older ledger data
   */
  getMinimumLedgerSlot(): Promise<number>;
  /**
   * Fetch the slot of the lowest confirmed block that has not been purged from the ledger
   */
  getFirstAvailableBlock(): Promise<number>;
  /**
   * Fetch information about the current supply
   */
  getSupply(
    _config?: GetSupplyConfig | Commitment,
  ): Promise<RpcResponseAndContext<Supply>>;
  /**
   * Fetch the current supply of a token mint
   */
  getTokenSupply(
    _tokenMintAddress: PublicKey,
    _commitment?: Commitment,
  ): Promise<RpcResponseAndContext<TokenAmount>>;
  /**
   * Fetch the current balance of a token account
   */
  getTokenAccountBalance(
    _tokenAddress: PublicKey,
    _commitment?: Commitment,
  ): Promise<RpcResponseAndContext<TokenAmount>>;
  /**
   * Fetch all the token accounts owned by the specified account
   *
   * @return {Promise<RpcResponseAndContext<Array<{pubkey: PublicKey, account: AccountInfo<Buffer>}>>>}
   */
  getTokenAccountsByOwner(
    _ownerAddress: PublicKey,
    _filter: TokenAccountsFilter,
    _commitmentOrConfig?: Commitment | GetTokenAccountsByOwnerConfig,
  ): Promise<
    RpcResponseAndContext<
      Array<{
        pubkey: PublicKey;
        account: AccountInfo<Buffer>;
      }>
    >
  >;
  /**
   * Fetch parsed token accounts owned by the specified account
   *
   * @return {Promise<RpcResponseAndContext<Array<{pubkey: PublicKey, account: AccountInfo<ParsedAccountData>}>>>}
   */
  getParsedTokenAccountsByOwner(
    _ownerAddress: PublicKey,
    _filter: TokenAccountsFilter,
    _commitment?: Commitment,
  ): Promise<
    RpcResponseAndContext<
      Array<{
        pubkey: PublicKey;
        account: AccountInfo<ParsedAccountData>;
      }>
    >
  >;
  /**
   * Fetch the 20 largest accounts with their current balances
   */
  getLargestAccounts(
    _config?: GetLargestAccountsConfig,
  ): Promise<RpcResponseAndContext<Array<AccountBalancePair>>>;
  /**
   * Fetch the 20 largest token accounts with their current balances
   * for a given mint.
   */
  getTokenLargestAccounts(
    _mintAddress: PublicKey,
    _commitment?: Commitment,
  ): Promise<RpcResponseAndContext<Array<TokenAccountBalancePair>>>;
  /**
   * Fetch all the account info for the specified public key, return with context
   */
  getAccountInfoAndContext(
    _publicKey: PublicKey,
    _commitmentOrConfig?: Commitment | GetAccountInfoConfig,
  ): Promise<RpcResponseAndContext<AccountInfo<Buffer> | null>>;
  /**
   * Fetch parsed account info for the specified public key
   */
  getParsedAccountInfo(
    _publicKey: PublicKey,
    _commitmentOrConfig?: Commitment | GetAccountInfoConfig,
  ): Promise<
    RpcResponseAndContext<AccountInfo<Buffer | ParsedAccountData> | null>
  >;
  /**
   * Fetch all the account info for the specified public key
   */
  getAccountInfo(
    _publicKey: PublicKey,
    _commitmentOrConfig?: Commitment | GetAccountInfoConfig,
  ): Promise<AccountInfo<Buffer> | null>;
  /**
   * Fetch all the account info for multiple accounts specified by an array of public keys, return with context
   */
  getMultipleAccountsInfoAndContext(
    _publicKeys: PublicKey[],
    _commitmentOrConfig?: Commitment | GetMultipleAccountsConfig,
  ): Promise<RpcResponseAndContext<(AccountInfo<Buffer> | null)[]>>;
  /**
   * Fetch all the account info for multiple accounts specified by an array of public keys
   */
  getMultipleAccountsInfo(
    _publicKeys: PublicKey[],
    _commitmentOrConfig?: Commitment | GetMultipleAccountsConfig,
  ): Promise<(AccountInfo<Buffer> | null)[]>;
  /**
   * Returns epoch activation information for a stake account that has been delegated
   */
  getStakeActivation(
    _publicKey: PublicKey,
    _commitmentOrConfig?: Commitment | GetStakeActivationConfig,
    _epoch?: number,
  ): Promise<StakeActivationData>;
  /**
   * Fetch all the accounts owned by the specified program id
   *
   * @return {Promise<Array<{pubkey: PublicKey, account: AccountInfo<Buffer>}>>}
   */
  getProgramAccounts(
    _programId: PublicKey,
    _configOrCommitment?: GetProgramAccountsConfig | Commitment,
  ): Promise<
    Array<{
      pubkey: PublicKey;
      account: AccountInfo<Buffer>;
    }>
  >;
  /**
   * Fetch and parse all the accounts owned by the specified program id
   *
   * @return {Promise<Array<{pubkey: PublicKey, account: AccountInfo<Buffer | ParsedAccountData>}>>}
   */
  getParsedProgramAccounts(
    _programId: PublicKey,
    _configOrCommitment?: GetParsedProgramAccountsConfig | Commitment,
  ): Promise<
    Array<{
      pubkey: PublicKey;
      account: AccountInfo<Buffer | ParsedAccountData>;
    }>
  >;
  confirmTransaction(
    _strategy: BlockheightBasedTransactionConfirmationStrategy,
    _commitment?: Commitment,
  ): Promise<RpcResponseAndContext<SignatureResult>>;
  /** @deprecated Instead, call `confirmTransaction` using a `TransactionConfirmationConfig` */
  confirmTransaction(
    _strategy: TransactionSignature,
    _commitment?: Commitment,
  ): Promise<RpcResponseAndContext<SignatureResult>>;
  /**
   * Return the list of nodes that are currently participating in the cluster
   */
  getClusterNodes(): Promise<Array<ContactInfo>>;
  /**
   * Return the list of nodes that are currently participating in the cluster
   */
  getVoteAccounts(_commitment?: Commitment): Promise<VoteAccountStatus>;
  /**
   * Fetch the current slot that the node is processing
   */
  getSlot(_commitmentOrConfig?: Commitment | GetSlotConfig): Promise<number>;
  /**
   * Fetch the current slot leader of the cluster
   */
  getSlotLeader(
    _commitmentOrConfig?: Commitment | GetSlotLeaderConfig,
  ): Promise<string>;
  /**
   * Fetch `limit` number of slot leaders starting from `startSlot`
   *
   * @param startSlot fetch slot leaders starting from this slot
   * @param limit number of slot leaders to return
   */
  getSlotLeaders(_startSlot: number, _limit: number): Promise<Array<PublicKey>>;
  /**
   * Fetch the current status of a signature
   */
  getSignatureStatus(
    _signature: TransactionSignature,
    _config?: SignatureStatusConfig,
  ): Promise<RpcResponseAndContext<SignatureStatus | null>>;
  /**
   * Fetch the current statuses of a batch of signatures
   */
  getSignatureStatuses(
    _signatures: Array<TransactionSignature>,
    _config?: SignatureStatusConfig,
  ): Promise<RpcResponseAndContext<Array<SignatureStatus | null>>>;
  /**
   * Fetch the current transaction count of the cluster
   */
  getTransactionCount(
    _commitmentOrConfig?: Commitment | GetTransactionCountConfig,
  ): Promise<number>;
  /**
   * Fetch the current total currency supply of the cluster in lamports
   *
   * @deprecated Deprecated since v1.2.8. Please use {@link getSupply} instead.
   */
  getTotalSupply(_commitment?: Commitment): Promise<number>;
  /**
   * Fetch the cluster InflationGovernor parameters
   */
  getInflationGovernor(_commitment?: Commitment): Promise<InflationGovernor>;
  /**
   * Fetch the inflation reward for a list of addresses for an epoch
   */
  getInflationReward(
    _addresses: PublicKey[],
    _epoch?: number,
    _commitmentOrConfig?: Commitment | GetInflationRewardConfig,
  ): Promise<(InflationReward | null)[]>;
  /**
   * Fetch the Epoch Info parameters
   */
  getEpochInfo(
    _commitmentOrConfig?: Commitment | GetEpochInfoConfig,
  ): Promise<EpochInfo>;
  /**
   * Fetch the Epoch Schedule parameters
   */
  getEpochSchedule(): Promise<EpochSchedule>;
  /**
   * Fetch the leader schedule for the current epoch
   * @return {Promise<RpcResponseAndContext<LeaderSchedule>>}
   */
  getLeaderSchedule(): Promise<LeaderSchedule>;
  /**
   * Fetch the minimum balance needed to exempt an account of `dataLength`
   * size from rent
   */
  getMinimumBalanceForRentExemption(
    _dataLength: number,
    _commitment?: Commitment,
  ): Promise<number>;
  /**
   * Fetch a recent blockhash from the cluster, return with context
   * @return {Promise<RpcResponseAndContext<{blockhash: Blockhash, feeCalculator: FeeCalculator}>>}
   *
   * @deprecated Deprecated since Solana v1.8.0. Please use {@link getLatestBlockhash} instead.
   */
  getRecentBlockhashAndContext(_commitment?: Commitment): Promise<
    RpcResponseAndContext<{
      blockhash: Blockhash;
      feeCalculator: FeeCalculator;
    }>
  >;
  /**
   * Fetch recent performance samples
   * @return {Promise<Array<PerfSample>>}
   */
  getRecentPerformanceSamples(_limit?: number): Promise<Array<PerfSample>>;
  /**
   * Fetch the fee calculator for a recent blockhash from the cluster, return with context
   *
   * @deprecated Deprecated since Solana v1.8.0. Please use {@link getFeeForMessage} instead.
   */
  getFeeCalculatorForBlockhash(
    _blockhash: Blockhash,
    _commitment?: Commitment,
  ): Promise<RpcResponseAndContext<FeeCalculator | null>>;
  /**
   * Fetch the fee for a message from the cluster, return with context
   */
  getFeeForMessage(
    _message: Message,
    _commitment?: Commitment,
  ): Promise<RpcResponseAndContext<number>>;
  /**
   * Fetch a recent blockhash from the cluster
   * @return {Promise<{blockhash: Blockhash, feeCalculator: FeeCalculator}>}
   *
   * @deprecated Deprecated since Solana v1.8.0. Please use {@link getLatestBlockhash} instead.
   */
  getRecentBlockhash(_commitment?: Commitment): Promise<{
    blockhash: Blockhash;
    feeCalculator: FeeCalculator;
  }>;
  /**
   * Fetch the latest blockhash from the cluster
   * @return {Promise<BlockhashWithExpiryBlockHeight>}
   */
  getLatestBlockhash(
    _commitmentOrConfig?: Commitment | GetLatestBlockhashConfig,
  ): Promise<BlockhashWithExpiryBlockHeight>;
  /**
   * Fetch the latest blockhash from the cluster
   * @return {Promise<BlockhashWithExpiryBlockHeight>}
   */
  getLatestBlockhashAndContext(
    _commitmentOrConfig?: Commitment | GetLatestBlockhashConfig,
  ): Promise<RpcResponseAndContext<BlockhashWithExpiryBlockHeight>>;
  /**
   * Fetch the node version
   */
  getVersion(): Promise<Version>;
  /**
   * Fetch the genesis hash
   */
  getGenesisHash(): Promise<string>;
  /**
   * Fetch a processed block from the cluster.
   *
   * @deprecated Instead, call `getBlock` using a `GetVersionedBlockConfig` by
   * setting the `maxSupportedTransactionVersion` property.
   */
  getBlock(
    _slot: number,
    _rawConfig?: GetBlockConfig,
  ): Promise<BlockResponse | null>;
  /**
   * Fetch a processed block from the cluster.
   */
  getBlock(
    _slot: number,
    _rawConfig?: GetVersionedBlockConfig,
  ): Promise<VersionedBlockResponse | null>;
  getBlockHeight(
    _commitmentOrConfig?: Commitment | GetBlockHeightConfig,
  ): Promise<number>;
  getBlockProduction(
    _configOrCommitment?: GetBlockProductionConfig | Commitment,
  ): Promise<RpcResponseAndContext<BlockProduction>>;
  /**
   * Fetch a confirmed or finalized transaction from the cluster.
   *
   * @deprecated Instead, call `getTransaction` using a
   * `GetVersionedTransactionConfig` by setting the
   * `maxSupportedTransactionVersion` property.
   */
  getTransaction(
    _signature: string,
    _rawConfig?: GetTransactionConfig,
  ): Promise<TransactionResponse | null>;
  /**
   * Fetch a confirmed or finalized transaction from the cluster.
   */
  getTransaction(
    _signature: string,
    _rawConfig: GetVersionedTransactionConfig,
  ): Promise<VersionedTransactionResponse | null>;
  /**
   * Fetch parsed transaction details for a confirmed or finalized transaction
   */
  getParsedTransaction(
    _signature: TransactionSignature,
    _commitmentOrConfig?: GetVersionedTransactionConfig | Finality,
  ): Promise<ParsedTransactionWithMeta | null>;
  /**
   * Fetch parsed transaction details for a batch of confirmed transactions
   */
  getParsedTransactions(
    _signatures: TransactionSignature[],
    _commitmentOrConfig?: GetVersionedTransactionConfig | Finality,
  ): Promise<(ParsedTransactionWithMeta | null)[]>;
  /**
   * Fetch transaction details for a batch of confirmed transactions.
   * Similar to {@link getParsedTransactions} but returns a {@link TransactionResponse}.
   *
   * @deprecated Instead, call `getTransactions` using a
   * `GetVersionedTransactionConfig` by setting the
   * `maxSupportedTransactionVersion` property.
   */
  getTransactions(
    _signatures: TransactionSignature[],
    _commitmentOrConfig?: GetTransactionConfig | Finality,
  ): Promise<(TransactionResponse | null)[]>;
  /**
   * Fetch transaction details for a batch of confirmed transactions.
   * Similar to {@link getParsedTransactions} but returns a {@link
   * VersionedTransactionResponse}.
   */
  getTransactions(
    _signatures: TransactionSignature[],
    _commitmentOrConfig: GetVersionedTransactionConfig | Finality,
  ): Promise<(VersionedTransactionResponse | null)[]>;
  /**
   * Fetch a list of Transactions and transaction statuses from the cluster
   * for a confirmed block.
   *
   * @deprecated Deprecated since v1.13.0. Please use {@link getBlock} instead.
   */
  getConfirmedBlock(
    _slot: number,
    _commitment?: Finality,
  ): Promise<ConfirmedBlock>;
  /**
   * Fetch confirmed blocks between two slots
   */
  getBlocks(
    _startSlot: number,
    _endSlot?: number,
    _commitment?: Finality,
  ): Promise<Array<number>>;
  /**
   * Fetch a list of Signatures from the cluster for a block, excluding rewards
   */
  getBlockSignatures(
    _slot: number,
    _commitment?: Finality,
  ): Promise<BlockSignatures>;
  /**
   * Fetch a list of Signatures from the cluster for a confirmed block, excluding rewards
   *
   * @deprecated Deprecated since Solana v1.8.0. Please use {@link getBlockSignatures} instead.
   */
  getConfirmedBlockSignatures(
    _slot: number,
    _commitment?: Finality,
  ): Promise<BlockSignatures>;
  /**
   * Fetch a transaction details for a confirmed transaction
   *
   * @deprecated Deprecated since Solana v1.8.0. Please use {@link getTransaction} instead.
   */
  getConfirmedTransaction(
    _signature: TransactionSignature,
    _commitment?: Finality,
  ): Promise<ConfirmedTransaction | null>;
  /**
   * Fetch parsed transaction details for a confirmed transaction
   *
   * @deprecated Deprecated since Solana v1.8.0. Please use {@link getParsedTransaction} instead.
   */
  getParsedConfirmedTransaction(
    _signature: TransactionSignature,
    _commitment?: Finality,
  ): Promise<ParsedConfirmedTransaction | null>;
  /**
   * Fetch parsed transaction details for a batch of confirmed transactions
   *
   * @deprecated Deprecated since Solana v1.8.0. Please use {@link getParsedTransactions} instead.
   */
  getParsedConfirmedTransactions(
    _signatures: TransactionSignature[],
    _commitment?: Finality,
  ): Promise<(ParsedConfirmedTransaction | null)[]>;
  /**
   * Fetch a list of all the confirmed signatures for transactions involving an address
   * within a specified slot range. Max range allowed is 10,000 slots.
   *
   * @deprecated Deprecated since v1.3. Please use {@link getConfirmedSignaturesForAddress2} instead.
   *
   * @param address queried address
   * @param startSlot start slot, inclusive
   * @param endSlot end slot, inclusive
   */
  getConfirmedSignaturesForAddress(
    _address: PublicKey,
    _startSlot: number,
    _endSlot: number,
  ): Promise<Array<TransactionSignature>>;
  /**
   * Returns confirmed signatures for transactions involving an
   * address backwards in time from the provided signature or most recent confirmed block
   *
   *
   * @param address queried address
   * @param options
   */
  getConfirmedSignaturesForAddress2(
    _address: PublicKey,
    _options?: ConfirmedSignaturesForAddress2Options,
    _commitment?: Finality,
  ): Promise<Array<ConfirmedSignatureInfo>>;
  /**
   * Returns confirmed signatures for transactions involving an
   * address backwards in time from the provided signature or most recent confirmed block
   *
   *
   * @param address queried address
   * @param options
   */
  getSignaturesForAddress(
    _address: PublicKey,
    _options?: SignaturesForAddressOptions,
    _commitment?: Finality,
  ): Promise<Array<ConfirmedSignatureInfo>>;
  getAddressLookupTable(
    _accountKey: PublicKey,
    _config?: GetAccountInfoConfig,
  ): Promise<RpcResponseAndContext<AddressLookupTableAccount | null>>;
  /**
   * Fetch the contents of a Nonce account from the cluster, return with context
   */
  getNonceAndContext(
    _nonceAccount: PublicKey,
    _commitment?: Commitment,
  ): Promise<RpcResponseAndContext<NonceAccount | null>>;
  /**
   * Fetch the contents of a Nonce account from the cluster
   */
  getNonce(
    _nonceAccount: PublicKey,
    _commitment?: Commitment,
  ): Promise<NonceAccount | null>;
  /**
   * Request an allocation of lamports to the specified address
   *
   * ```typescript
   * import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
   *
   * (async () => {
   *   const connection = new Connection("https://api.testnet.solana.com", "confirmed");
   *   const myAddress = new PublicKey("2nr1bHFT86W9tGnyvmYW4vcHKsQB3sVQfnddasz4kExM");
   *   const signature = await connection.requestAirdrop(myAddress, LAMPORTS_PER_SOL);
   *   await connection.confirmTransaction(signature);
   * })();
   * ```
   */
  requestAirdrop(
    _to: PublicKey,
    _lamports: number,
  ): Promise<TransactionSignature>;
  /**
   * get the stake minimum delegation
   */
  getStakeMinimumDelegation(
    _config?: GetStakeMinimumDelegationConfig,
  ): Promise<RpcResponseAndContext<number>>;
  /**
   * Simulate a transaction
   *
   * @deprecated Instead, call {@link simulateTransaction} with {@link
   * VersionedTransaction} and {@link SimulateTransactionConfig} parameters
   */
  simulateTransaction(
    _transactionOrMessage: Transaction | Message,
    _signers?: Array<Signer>,
    _includeAccounts?: boolean | Array<PublicKey>,
  ): Promise<RpcResponseAndContext<SimulatedTransactionResponse>>;
  /**
   * Simulate a transaction
   */
  simulateTransaction(
    _transaction: VersionedTransaction,
    _config?: SimulateTransactionConfig,
  ): Promise<RpcResponseAndContext<SimulatedTransactionResponse>>;
  /**
   * Sign and send a transaction
   *
   * @deprecated Instead, call {@link sendTransaction} with a {@link
   * VersionedTransaction}
   */
  sendTransaction(
    _transaction: Transaction,
    _signers: Array<Signer>,
    _options?: SendOptions,
  ): Promise<TransactionSignature>;
  /**
   * Send a signed transaction
   */
  sendTransaction(
    _transaction: VersionedTransaction,
    _options?: SendOptions,
  ): Promise<TransactionSignature>;
  /**
   * Send a transaction that has already been signed and serialized into the
   * wire format
   */
  sendRawTransaction(
    _rawTransaction: Buffer | Uint8Array | Array<number>,
    _options?: SendOptions,
  ): Promise<TransactionSignature>;
  /**
   * Send a transaction that has already been signed, serialized into the
   * wire format, and encoded as a base64 string
   */
  sendEncodedTransaction(
    _encodedTransaction: string,
    _options?: SendOptions,
  ): Promise<TransactionSignature>;
  /**
   * Register a callback to be invoked whenever the specified account changes
   *
   * @param publicKey Public key of the account to monitor
   * @param callback Function to invoke whenever the account is changed
   * @param commitment Specify the commitment level account changes must reach before notification
   * @return subscription id
   */
  onAccountChange(
    _publicKey: PublicKey,
    _callback: AccountChangeCallback,
    _commitment?: Commitment,
  ): ClientSubscriptionId;
  /**
   * Deregister an account notification callback
   *
   * @param id client subscription id to deregister
   */
  removeAccountChangeListener(
    _clientSubscriptionId: ClientSubscriptionId,
  ): Promise<void>;
  /**
   * Register a callback to be invoked whenever accounts owned by the
   * specified program change
   *
   * @param programId Public key of the program to monitor
   * @param callback Function to invoke whenever the account is changed
   * @param commitment Specify the commitment level account changes must reach before notification
   * @param filters The program account filters to pass into the RPC method
   * @return subscription id
   */
  onProgramAccountChange(
    _programId: PublicKey,
    _callback: ProgramAccountChangeCallback,
    _commitment?: Commitment,
    _filters?: GetProgramAccountsFilter[],
  ): ClientSubscriptionId;
  /**
   * Deregister an account notification callback
   *
   * @param id client subscription id to deregister
   */
  removeProgramAccountChangeListener(
    _clientSubscriptionId: ClientSubscriptionId,
  ): Promise<void>;
  /**
   * Registers a callback to be invoked whenever logs are emitted.
   */
  onLogs(
    _filter: LogsFilter,
    _callback: LogsCallback,
    _commitment?: Commitment,
  ): ClientSubscriptionId;
  /**
   * Deregister a logs callback.
   *
   * @param id client subscription id to deregister.
   */
  removeOnLogsListener(
    _clientSubscriptionId: ClientSubscriptionId,
  ): Promise<void>;
  /**
   * Register a callback to be invoked upon slot changes
   *
   * @param callback Function to invoke whenever the slot changes
   * @return subscription id
   */
  onSlotChange(_callback: SlotChangeCallback): ClientSubscriptionId;
  /**
   * Deregister a slot notification callback
   *
   * @param id client subscription id to deregister
   */
  removeSlotChangeListener(
    _clientSubscriptionId: ClientSubscriptionId,
  ): Promise<void>;
  /**
   * Register a callback to be invoked upon slot updates. {@link SlotUpdate}'s
   * may be useful to track live progress of a cluster.
   *
   * @param callback Function to invoke whenever the slot updates
   * @return subscription id
   */
  onSlotUpdate(_callback: SlotUpdateCallback): ClientSubscriptionId;
  /**
   * Deregister a slot update notification callback
   *
   * @param id client subscription id to deregister
   */
  removeSlotUpdateListener(
    _clientSubscriptionId: ClientSubscriptionId,
  ): Promise<void>;
  /**
   * Register a callback to be invoked upon signature updates
   *
   * @param signature Transaction signature string in base 58
   * @param callback Function to invoke on signature notifications
   * @param commitment Specify the commitment level signature must reach before notification
   * @return subscription id
   */
  onSignature(
    _signature: TransactionSignature,
    _callback: SignatureResultCallback,
    _commitment?: Commitment,
  ): ClientSubscriptionId;
  /**
   * Register a callback to be invoked when a transaction is
   * received and/or processed.
   *
   * @param signature Transaction signature string in base 58
   * @param callback Function to invoke on signature notifications
   * @param options Enable received notifications and set the commitment
   *   level that signature must reach before notification
   * @return subscription id
   */
  onSignatureWithOptions(
    _signature: TransactionSignature,
    _callback: SignatureSubscriptionCallback,
    _options?: SignatureSubscriptionOptions,
  ): ClientSubscriptionId;
  /**
   * Deregister a signature notification callback
   *
   * @param id client subscription id to deregister
   */
  removeSignatureListener(
    _clientSubscriptionId: ClientSubscriptionId,
  ): Promise<void>;
  /**
   * Register a callback to be invoked upon root changes
   *
   * @param callback Function to invoke whenever the root changes
   * @return subscription id
   */
  onRootChange(_callback: RootChangeCallback): ClientSubscriptionId;
  /**
   * Deregister a root notification callback
   *
   * @param id client subscription id to deregister
   */
  removeRootChangeListener(
    _clientSubscriptionId: ClientSubscriptionId,
  ): Promise<void>;
}
