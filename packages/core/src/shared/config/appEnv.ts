import { z } from 'zod';

// 모든 앱이 함께 쓰는 환경 변수 스키마다. 앱 전용 변수는 앱에서 AppEnvSchema.extend({...})로 더한다.
// core는 process.env를 읽지 않는다. 값은 앱이 모아서 parseEnv에 넘긴다.
export const AppEnvSchema = z.object({
  API_BASE_URL: z.url({
    protocol: /^https?$/,
    error: (issue) =>
      issue.input === undefined
        ? '값이 없습니다. .env.example을 참고해 설정하세요.'
        : 'http 또는 https URL이어야 합니다.',
  }),
});

export type AppEnv = z.infer<typeof AppEnvSchema>;

// 검증에 실패하면 어떤 변수가 왜 틀렸는지 모아서 throw한다.
export const parseEnv = <Schema extends z.ZodType>(
  schema: Schema,
  source: Record<string, string | undefined>,
): z.infer<Schema> => {
  const parsed = schema.safeParse(source);

  if (!parsed.success) {
    const details = parsed.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('\n');

    throw new Error(`환경 변수 검증에 실패했습니다.\n${details}`);
  }

  return parsed.data;
};
