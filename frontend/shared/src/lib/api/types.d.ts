interface IPageSetting {
    title?: string;
}

type JsendResponse<T> = {
    status: 'success' | 'fail' | 'error';
    data: T | null;
    message: string | null;
    // extension
    redirectUrl?: string;
};

type JsendOptions = {
    // stop auto-redirect according to the Location response header.
    stopAutoRedirect: boolean;
};

 
// namespace ListWeatherForcastQuery {
//     type Request = {
//         // nothing
//     };

//     type Response = {
//         date: string;
//         temperatureC: number;
//         temperatureF: number;
//         summary: string;
//     }[];
// }

// namespace ListStockInfoQuery {
//     type Request = {
//         // nothing
//     };

//     type Response = {
//         dateTime: string;
//         symbol: string;
//         price: number;
//     }[];
// }

namespace GetSiginStatusQuery {
    // type Request = {
    //     // nothing
    // };

    type Response = {
        isAuthenticated: boolean;
        claims: Record<string, string>;
        userMenu: {
            top: SideMenuItem[] | null;
            left: SideMenuItem[] | null;
        };
        isVerified: boolean;
    };
}

namespace SignoutCommand {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    type Request = {
        /* nothing */
    };
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    type Response = {
        /* nothing */
    };
}
 
