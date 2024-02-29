import { md5Password } from "@/utils/md5Password";

export interface ApiInterface {
  get_ids: {
    params: [data?: {
      offset: number;
      limit: number;
    }];
    result: string[];
  };

  get_items: {
    params: [data: {
      ids: string[];
    }];
    result: {
      id: string;
      brand: string | null;
      price: number;
      product: string;
    }[];
  };

  get_fields: {
    params: [data?: {
      field: string;
      offset: number;
      limit: number;
    }];
    result: any[];
  };

  filter: {
    params: [data: {
      [key: string]: any;
    }];
    result: string[];
  };
}

export class Api {
  constructor(
    private _url: string,
    private _password: string
  ) { }

  action<K extends keyof ApiInterface>(
    action: K,
    ...args: ApiInterface[K]['params']
  ): Promise<ApiInterface[K]['result']> {
    return fetch(this._url, {
      method: 'POST',
      headers: {
        'X-Auth': md5Password(this._password),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, params: args[0] })
    }).then(e => {
      if (e.status !== 200)
        throw new Error(e.statusText);
      return e.json().then(e => e.result);
    });
  }
}