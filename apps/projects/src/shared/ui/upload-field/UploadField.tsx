'use client';

import { type ChangeEvent, type DragEvent, type ReactNode, useId } from 'react';

import Image from 'next/image';

import { cn } from '@datagsm/core/shared/lib';
import { Button, buttonVariants } from '@datagsm/core/shared/ui/button';
import { ImageIcon, TrashIcon, UploadIcon, WarningIcon } from '@datagsm/core/shared/ui/icon';

type UploadFieldState = 'empty' | 'filled' | 'uploading' | 'error';

interface UploadFieldProps {
  // Figma Kind. icon은 64 정사각 미리보기 + 버튼, image는 칸 폭 16:9 미리보기(비었을 때는 끌어 놓기 칸).
  variant?: 'icon' | 'image';
  label: ReactNode;
  // 허용 형식·크기 같은 안내 문구.
  hint?: ReactNode;
  // 있으면 Error 상태다. hint 자리에 이 문구를 error 색으로 보여 준다.
  error?: ReactNode;
  // 올렸거나 올리는 중인 이미지 주소(업로드 결과 URL 또는 URL.createObjectURL). 있으면 Filled 상태다.
  previewUrl?: string;
  // 0~100. 있으면 Uploading 상태다.
  progress?: number;
  id?: string;
  name?: string;
  accept?: string;
  // 고른 파일 하나를 넘긴다. 형식·크기 검사와 업로드는 쓰는 쪽이 하고 결과를 progress·error·previewUrl로 돌려준다.
  // 끌어 놓은 파일은 accept로 걸러지지 않으므로 형식 검사는 쓰는 쪽에서 꼭 한다.
  onSelectFile: (file: File) => void;
  // Filled의 "지우기". 없으면 버튼을 그리지 않는다.
  onRemove?: () => void;
  className?: string;
}

const TRIGGER_TEXT = {
  empty: '이미지 올리기',
  filled: '바꾸기',
  error: '다시 올리기',
} satisfies Record<Exclude<UploadFieldState, 'uploading'>, string>;

// 미리보기 칸의 선·면·아이콘 색. 아이콘은 currentColor라 글자색을 따른다.
const FRAME_CLASS_NAME = {
  empty: 'border border-dashed border-line text-foreground-muted',
  filled: 'bg-subtle text-foreground-muted',
  uploading: 'bg-subtle text-foreground-muted opacity-50',
  error: 'border border-dashed border-error text-error',
} satisfies Record<UploadFieldState, string>;

// Figma DataGSMv2 "WF/Upload field"(Kind × State)를 옮겼다. 화면만 그리고 업로드 요청은 하지 않는다.
// - State는 prop이 아니라 값에서 정한다: progress가 있으면 Uploading, error가 있으면 Error,
//   previewUrl이 있으면 Filled, 아니면 Empty. 따로 state를 받으면 'filled인데 이미지가 없음' 같은 어긋난 조합이 생긴다.
// - 파일 고르기는 네이티브 <input type="file">이다. 입력은 sr-only로 숨기고 버튼 모양의 <label>이 입력을 연다.
//   그래서 키보드로는 입력 자체에 포커스해 Enter·Space로 열고, 화면 리더는 "라벨 + 버튼 문구"를 입력의 이름으로 읽는다.
//   입력이 숨어 있어 포커스 표시는 peer-focus-visible로 버튼 모양에 그린다(Figma에 포커스 디자인이 없어 strong 2px 선).
// - Uploading의 "올리는 중…"은 눌리지 않는 secondary 버튼이고 입력도 막는다.
// - Kind=이미지의 빈 칸·오류 칸은 파일을 끌어 놓을 수 있다(Figma "이미지를 끌어 놓거나 올리기를 누르세요").
// - 오류 문구는 FormField와 달리 경고 아이콘 없이 error 색 글자만 쓴다(Figma 설명 "오류 문구는 안내 속성에 넣는다").
// - 미리보기는 사용자 이미지라 next/image의 unoptimized로 그대로 보여 준다(blob: 주소는 최적화할 수 없다).
export const UploadField = ({
  variant = 'icon',
  label,
  hint,
  error,
  previewUrl,
  progress,
  id,
  name,
  accept = 'image/*',
  onSelectFile,
  onRemove,
  className,
}: UploadFieldProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const messageId = `${inputId}-message`;
  const state: UploadFieldState =
    progress !== undefined ? 'uploading' : error ? 'error' : previewUrl ? 'filled' : 'empty';
  const message = state === 'error' ? error : hint;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // 같은 파일을 다시 골라도 change가 일어나도록 값을 비운다(오류 뒤 "다시 올리기").
    event.target.value = '';
    if (file) onSelectFile(file);
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) onSelectFile(file);
  };

  const trigger = (
    <>
      <input
        id={inputId}
        type="file"
        name={name}
        accept={accept}
        disabled={state === 'uploading'}
        aria-describedby={message ? messageId : undefined}
        aria-invalid={state === 'error' || undefined}
        onChange={handleChange}
        className="peer sr-only"
      />
      {state === 'uploading' ? (
        <Button variant="secondary" disabled>
          올리는 중…
        </Button>
      ) : (
        <label
          htmlFor={inputId}
          className={cn(
            buttonVariants({ variant: 'secondary' }),
            'peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-strong',
          )}
        >
          {state !== 'filled' && <UploadIcon />}
          {TRIGGER_TEXT[state]}
        </label>
      )}
    </>
  );

  const buttons = (
    <div className="flex gap-2">
      {trigger}
      {state === 'filled' && onRemove && (
        <Button variant="ghost" onClick={onRemove}>
          <TrashIcon />
          지우기
        </Button>
      )}
    </div>
  );

  const progressBar = state === 'uploading' && (
    <div
      role="progressbar"
      aria-label="올리는 중"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      className="h-1 w-full overflow-hidden rounded bg-subtle"
    >
      <div className="h-full rounded bg-foreground-muted" style={{ width: `${progress}%` }} />
    </div>
  );

  // 미리보기 칸 안의 내용. 비었으면 올리기 아이콘, 오류면 경고 아이콘, 값이 있으면 이미지(없으면 이미지 자리 아이콘).
  // 이미지가 무엇인지는 사용자가 올린 것이라 설명할 수 없고 상태는 버튼 문구로 알 수 있어 alt를 비운다.
  const previewContent =
    state === 'empty' ? (
      <UploadIcon />
    ) : state === 'error' ? (
      <WarningIcon />
    ) : previewUrl ? (
      <Image src={previewUrl} alt="" fill unoptimized className="object-cover" />
    ) : (
      <ImageIcon />
    );

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={inputId} className="self-start text-label-14 text-foreground">
        {label}
      </label>
      {variant === 'icon' ? (
        <div className="flex items-center gap-4">
          <div
            className={cn(
              'relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded',
              FRAME_CLASS_NAME[state],
            )}
          >
            {previewContent}
          </div>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            {buttons}
            {progressBar}
          </div>
        </div>
      ) : state === 'empty' || state === 'error' ? (
        <div
          onDragOver={(event) => event.preventDefault()}
          onDrop={handleDrop}
          className={cn(
            'flex aspect-video flex-col items-center justify-center gap-4 rounded text-center',
            FRAME_CLASS_NAME[state],
          )}
        >
          {previewContent}
          <p className="text-label-14">
            {state === 'error'
              ? '이미지를 다시 올리세요'
              : '이미지를 끌어 놓거나 올리기를 누르세요'}
          </p>
          {buttons}
        </div>
      ) : (
        <>
          <div
            className={cn(
              'relative flex aspect-video items-center justify-center overflow-hidden rounded',
              FRAME_CLASS_NAME[state],
            )}
          >
            {previewContent}
          </div>
          {progressBar}
          {buttons}
        </>
      )}
      {message && (
        <p
          id={messageId}
          role={state === 'error' ? 'alert' : undefined}
          className={cn(
            'text-label-14',
            state === 'error' ? 'text-error' : 'text-foreground-muted',
          )}
        >
          {message}
        </p>
      )}
    </div>
  );
};
