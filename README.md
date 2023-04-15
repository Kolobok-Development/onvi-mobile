## Description

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```


## API Reference

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

#### Refresh

```http
  GET /auth/refresh
```
| Body | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `refreshToken` | `string` | **Required** Ex. '+79215431345' |

