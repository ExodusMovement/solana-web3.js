type RpcRequest = {
  method: string;
  params?: Array<any>;
};

type RpcResponse = {
  context: {
    slot: number;
  };
  value: any | Promise<any>;
};

const mockRpcSocket: Array<[RpcRequest, RpcResponse | Promise<RpcResponse>]> =
  [];

export const mockRpcMessage = ({
  method,
  params,
  result,
}: {
  method: string;
  params: Array<any>;
  result: any | Promise<any>;
}) => {
  mockRpcSocket.push([
    {method, params},
    {
      context: {slot: 11},
      value: result,
    },
  ]);
};
