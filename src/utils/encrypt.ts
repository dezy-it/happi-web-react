import { enc, lib, HmacSHA256 } from "crypto-js"
// import xml2js from "xml2js"

function base64url(source: lib.WordArray) {
    // Encode in classical base64
    let encodedSource = enc.Base64.stringify(source);

    // Remove padding equal characters
    encodedSource = encodedSource.replace(/=+$/, '');

    // Replace characters according to base64url specifications
    encodedSource = encodedSource.replace(/\+/g, '-');
    encodedSource = encodedSource.replace(/\//g, '_');

    return encodedSource;
}

const header = {
    "typ": "JWT",
    "alg": "HS256"
};

const secret = process.env.REACT_APP_UNEEQ_JWT_SECRET;

export function getEncryptedSessionId(sessionId: string) {
    const data = {
        "sessionId": sessionId
    };

    // encode header
    // const stringifiedHeader = CryptoJS.enc.Utf8.parse(JSON.stringify(header));
    const stringifiedHeader = enc.Utf8.parse(JSON.stringify(header))
    const encodedHeader = base64url(stringifiedHeader);

    // encode data
    const stringifiedData = enc.Utf8.parse(JSON.stringify(data));
    const encodedData = base64url(stringifiedData);

    // build token
    const token = encodedHeader + "." + encodedData;

    // sign token
    const signature = base64url(HmacSHA256(token, secret));
    const signedToken = token + "." + signature;

    return signedToken;
}

// export const parseAnswer = async (text: string) => {
//     let result: any = {}
//     let parsedAnswer = text.replace(/(\r\n|\n|\r)/gm, ' ')

//     try {
//         let parser = new xml2js.Parser()
//         result = await parser.parseStringPromise(`<test>${parsedAnswer}</test>`)

//         switch (typeof result.test) {
//             case 'object':
//             /* The response was parsed and is of type object, so the response from the NLP platform already
//              * contains markup which is structurally valid. A future revision of this function will add
//              * deeper validation of structure (such as the sequence of UneeQ behaviour tags and SSML tags)
//              * to catch errors before going to UneeQ */
//         }

//         return parsedAnswer.replace(/"/g, "'")
//     } catch (error) {
//         console.log(`The answer response contained structurally invalid markup: ${text}`)
//         throw error
//     }
// }
