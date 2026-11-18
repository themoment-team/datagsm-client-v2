// DataGSM 서버(the-sdk CommonApiResponse)가 감싸서 주는 응답 형태다.
// - status는 "200 OK"처럼 상태 코드와 이름을 합친 문자열이고, code는 같은 상태 코드 숫자다.
// - data가 null이면 필드 자체가 빠진다. 메시지만 주는 응답(삭제 등)은 ApiMessageResponse로 받는다.
// 감싸지 않는 예외:
// - 엑셀 내보내기(/v1/students/exports/excel, /v1/clubs/exports/excel)는 파일을 그대로 준다.
//   get<Blob>(url, { responseType: 'blob' })로 받는다.
// - 반환값이 없는 API(졸업 처리, 상태 변경 등)는 본문 없이 204로 답한다. post<void>처럼 받는다.
export interface ApiMessageResponse {
  status: string;
  code: number;
  message: string;
}

export interface ApiResponse<TData> extends ApiMessageResponse {
  data: TData;
}
