import {Buffer} from 'buffer';

import fetchImpl from './fetch-impl.js';
import {PublicKey} from './publickey.js';
import {Transaction, TransactionVersion} from './transaction/index.js';
import {Message, VersionedMessage} from './message/index.js';
import type {Blockhash} from './blockhash.js';
import type {TransactionSignature} from './transaction/index.js';
import type {CompiledInstruction} from './message/index.js';

/**
 * Attempt to use a recent blockhash for up to 30 seconds
 * @internal
 */
export const BLOCKHASH_CACHE_TIMEOUT_MS = 30 * 1000;

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
