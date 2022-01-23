declare module '@exodus/json-rpc' {
    interface IArgs {
        transport: any
    }

    class RPC {
      constructor(config: IArgs)

      callMethodWithRawResponse(method: string, args: Array<any>): any
    }

    export = RPC
}

declare module 'create-hash' {
   export default function (str: string): any;
}