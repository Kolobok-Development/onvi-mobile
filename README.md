## Description

## API Reference

### Error codes

| Internal Code | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `40` | `api_client` | Request validation errors  |
| `4` | `api_not_found` | Account not foud error |
| `5` | `api_authentication` | Invalid otp error|
| `6` | `server` | Faild to send otp |
| `41` | `api_client` | Account already exists error |
| `null` | `server` | Unkown internal server error  |

#### Error response body

```json
{
    "code": number | null,
    "type": string,
    "message": string,
    "timestamp": string,
    "path": string
}
```

#### Registrate new account

```http
  POST /auth/register
```

| Body | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `phone` | `string` | **Required** Ex. '+79215431345' |
| `otp` | `string` | **Required** Ex. '1234' |
| `isTermsAccepted` | `boolean` | **Required** |
| `isPromoTermsAccepted` | `boolean` | **Required** |

#### Respons 201

```json
  {
    "data": {
        "client": {
            "clientId": 490664,
            "name": "Новый пользователь",
            "inn": null,
            "email": null,
            "phone": "79215431345",
            "birthday": null,
            "clientTypeId": 1,
            "note": null,
            "isActivated": 1,
            "genderId": null,
            "correctPhone": "+79215431345",
            "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
            "isTokeValid": "1",
            "activatedDate": "2023-04-15T16:40:28.152Z",
            "isLk": null,
            "tag": null,
            "cards": [
                {
                    "cardId": 1372734,
                    "isLocked": 0,
                    "dateBegin": null,
                    "dateEnd": null,
                    "cardTypeId": 2086,
                    "devNomer": "79276745356",
                    "isDel": null,
                    "cmnCity": null,
                    "realBalance": null,
                    "airBalance": null,
                    "nomer": "79276745356",
                    "note": null,
                    "tag": null,
                    "mainCardId": null
                }
            ]
        },
        "tokens": {
            "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
            "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
        },
        "type": "register-success"
    },
    "path": "/api/v2/auth/register",
    "duration": "443ms",
    "method": "POST"
}
```

#### Error response 400 (Invalid request body)

```json
{
    "code": 40,
    "type": "api_client",
    "message": "Otp must be valid,Otp must be valid,otp must be a number string",
    "timestamp": "2023-04-17T20:00:34.855Z",
    "path": "/api/v2/auth/register"
}
```

#### Error response 422

```json
{
    "code": 5,
    "type": "api_authentication",
    "message": "Client +79219174645 invalid otp code",
    "timestamp": "2023-04-17T20:01:30.153Z",
    "path": "/api/v2/auth/register"
}
```

#### Error response 500

```json
{
    "code": null,
    "type": "server,
    "message": "Internal server error",
    "timestamp": "2023-04-17T20:01:30.153Z",
    "path": "/api/v2/auth/register"
}
```


#### Login

```http
  POST /auth/login
```

| Body | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `phone` | `string` | **Required** Ex. '+79215431345' |
| `otp` | `string` | **Required** Ex. '1234' |

#### Response 200

```json
      "data": {
        "client": {
            "clientId": 490664,
            "name": "Новый пользователь",
            "inn": null,
            "email": null,
            "phone": "79215431345",
            "birthday": null,
            "insDate": "2023-04-15",
            "updDate": "2023-04-15",
            "insUserId": null,
            "updUserId": null,
            "clientTypeId": 1,
            "note": null,
            "avto": null,
            "isActivated": 1,
            "discount": null,
            "genderId": null,
            "correctPhone": "+79215431345",
            "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
            "tokenId": null,
            "isTokeValid": "1",
            "activatedDate": "2023-04-15",
            "isActiveLight": null,
            "activatedDateLight": null,
            "isLk": null,
            "tag": null,
            "cards": [
                {
                    "cardId": 1372734,
                    "balance": 0,
                    "isLocked": 0,
                    "dateBegin": "2023-04-15",
                    "dateEnd": null,
                    "cardTypeId": 2086,
                    "devNomer": "79215431345",
                    "isDel": null,
                    "avto": null,
                    "monthLimit": null,
                    "discount": null,
                    "gosNomer": null,
                    "cmnCity": null,
                    "realBalance": null,
                    "airBalance": null,
                    "keyBalance": null,
                    "nomer": "79215431345",
                    "modelID": null,
                    "note": null,
                    "tag": null,
                    "dayLimit": null,
                    "mainCardId": null
                }
            ]
        },
        "tokens": {
            "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",
            "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9"
        },
        "type": "login-success"
    },
    "path": "/api/v2/auth/login",
    "duration": "1ms",
    "method": "POST"
```
#### Response 200 (Needs to register)
```json
  {
    "data": {
        "client": null,
        "tokens": null,
        "type": "register-required"
    },
    "path": "/api/v2/auth/login",
    "duration": "0ms",
    "method": "POST"
}
```

#### Error response 400 (Invalid request body)

```json
{
    "code": 40,
    "type": "api_client",
    "message": "Otp must be valid,Otp must be valid,otp must be a number string",
    "timestamp": "2023-04-17T20:00:34.855Z",
    "path": "/api/v2/auth/register"
}
```

#### Error response 404 (Account not found)

```json
{
    "code": 4,
    "type": "api_not_found",
    "message": "Account phone= +79219174645  is not found",
    "timestamp": "2023-04-17T20:00:34.855Z",
    "path": "/api/v2/auth/register"
}
```

#### Error response 422

```json
{
    "code": 5,
    "type": "api_authentication",
    "message": "Client +79219174645 invalid otp code",
    "timestamp": "2023-04-17T20:01:30.153Z",
    "path": "/api/v2/auth/register"
}
```

#### Error response 500

```json
{
    "code": null,
    "type": "server,
    "message": "Internal server error",
    "timestamp": "2023-04-17T20:01:30.153Z",
    "path": "/api/v2/auth/register"
}
```


#### Send Otp

```http
  POST /auth/send/otp
```

| Body | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `phone` | `string` | **Required** Ex. '+79215431345' |

#### Response 201
```json
 {
    "data": {
        "status": "sent_success",
        "target": "+79276745356"
    },
    "path": "/api/v2/auth/send/otp",
    "duration": "201ms",
    "method": "POST"
}
```

#### Error response 400 (Invalid request body)

```json
{
    "code": 40,
    "type": "api_client",
    "message": "Phone number must be valid",
    "timestamp": "2023-04-17T20:04:02.006Z",
    "path": "/api/v2/auth/send/otp"
}
```

#### Error response 500

```json
{
    "code": 6,
    "type": "server",
    "message": "Failed to send otp= 1234 target= +79276745356
",
    "timestamp": "2023-04-17T20:01:30.153Z",
    "path": "/api/v2/auth/register"
}
```

#### Error response 500 (unkown error)

```json
{
    "code": null,
    "type": "server,
    "message": "Internal server error",
    "timestamp": "2023-04-17T20:01:30.153Z",
    "path": "/api/v2/auth/register"
}
```



#### Refresh

```http
  GET /auth/refresh
```
| Body | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `refreshToken` | `string` | **Required** Ex. '' |

#### Response 200
```json
 {
    "data": {
        "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    },
    "path": "/api/v2/auth/refresh",
    "duration": "1ms",
    "method": "GET"
}
```

#### Error response 401

```json

```


#### Error response 500 (unkown error)

```json
{
    "code": null,
    "type": "server,
    "message": "Internal server error",
    "timestamp": "2023-04-17T20:01:30.153Z",
    "path": "/api/v2/auth/register"
}
```