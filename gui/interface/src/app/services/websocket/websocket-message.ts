export interface WebsocketMessage {
    method: string,
    data: object,
    id: string,
    requestID: string,
    status: string
}