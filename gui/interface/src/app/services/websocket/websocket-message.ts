export interface WebsocketMessageObject {
    method: string,
    data: object,
    id: string,
    requestID: string,
    status: string
}