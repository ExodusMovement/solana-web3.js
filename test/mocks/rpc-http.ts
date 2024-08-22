import bs58 from 'bs58';
import BN from 'bn.js';
import * as mockttp from 'mockttp';

import type {HttpHeaders, RpcParams} from '../../src/connection';

export const mockServer: mockttp.Mockttp | undefined =
  process.env.TEST_LIVE === undefined ? mockttp.getLocal() : undefined;

let uniqueCounter = 0;
export const uniqueSignature = () => {
  return bs58.encode(new BN(++uniqueCounter).toArray(undefined, 64));
};
export const uniqueBlockhash = () => {
  return bs58.encode(new BN(++uniqueCounter).toArray(undefined, 32));
};

export const mockErrorMessage = 'Invalid';
export const mockErrorResponse = {
  code: -32602,
  message: mockErrorMessage,
};

export const mockRpcBatchResponse = async ({
  batch,
  result,
  error,
}: {
  batch: RpcParams[];
  result: any[];
  error?: string;
}) => {
  if (!mockServer) return;

  const request = batch.map((batch: RpcParams) => {
    return {
      jsonrpc: '2.0',
      method: batch.methodName,
      params: batch.args,
    };
  });

  const response = result.map((result: any) => {
    return {
      jsonrpc: '2.0',
      id: '',
      result,
      error,
    };
  });

  await mockServer
    .post('/')
    .withJsonBodyIncluding(request)
    .thenReply(200, JSON.stringify(response));
};

function isPromise<T>(obj: PromiseLike<T> | T): obj is PromiseLike<T> {
  return (
    !!obj &&
    (typeof obj === 'object' || typeof obj === 'function') &&
    typeof (obj as any).then === 'function'
  );
}

export const mockRpcResponse = async ({
  method,
  params,
  value,
  error,
  withContext,
  withHeaders,
}: {
  method: string;
  params: Array<any>;
  value?: Promise<any> | any;
  error?: any;
  withContext?: boolean;
  withHeaders?: HttpHeaders;
}) => {
  if (!mockServer) return;

  await mockServer
    .post('/')
    .withJsonBodyIncluding({
      jsonrpc: '2.0',
      method,
      params,
    })
    .withHeaders(withHeaders || {})
    .thenCallback(async () => {
      try {
        const unwrappedValue = isPromise(value) ? await value : value;
        let result = unwrappedValue;
        if (withContext) {
          result = {
            context: {
              slot: 11,
            },
            value: unwrappedValue,
          };
        }
        return {
          statusCode: 200,
          json: {
            jsonrpc: '2.0',
            id: '',
            error,
            result,
          },
        };
      } catch (_e) {
        return {statusCode: 500};
      }
    });
};
