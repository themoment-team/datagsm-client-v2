import type { AxiosError } from 'axios';

interface ApiErrorInit {
  status: number;
  code: string;
  message: string;
}

// 모든 API 호출 실패는 이 형태로 통일된다. 원본 AxiosError는 cause에 남는다.
// - status: HTTP 상태 코드. 응답이 없는 실패(네트워크 오류, 타임아웃, 취소)는 0이다. 화면 분기는 이 값으로 한다.
// - message: 서버가 준 에러 문구. 없으면 axios의 메시지다.
// - code: axios 오류 코드(ERR_NETWORK, ECONNABORTED 등). status 0인 실패의 원인을 구분할 때 쓴다.
//   DataGSM 서버 본문의 code는 status와 같은 숫자라 담지 않는다.
export class ApiError extends Error implements ApiErrorInit {
  readonly status: number;
  readonly code: string;

  constructor({ status, code, message }: ApiErrorInit, options?: ErrorOptions) {
    super(message, options);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

const readMessage = (body: unknown) => {
  const message =
    typeof body === 'object' && body !== null ? (body as Record<string, unknown>).message : null;

  return typeof message === 'string' ? message : undefined;
};

export const toApiError = (error: AxiosError): ApiError =>
  new ApiError(
    {
      status: error.response?.status ?? 0,
      code: error.code ?? 'UNKNOWN',
      message: readMessage(error.response?.data) ?? error.message,
    },
    { cause: error },
  );
