import { Button, Result } from '@/UI';
import { useRouter } from 'next/router';
import React from 'react';

export const ErrorFallback = ({ error, error_description }) => {
  const router = useRouter();

  const handleBackHome = () => {
    router.push('/api/auth/login');
  };

  return (
    <div className="h-screen flex items-center justify-center">
      <Result
        status="500"
        title="Có lỗi trong quá trình thực thi."
        subTitle="Nếu lỗi tiếp tục xảy ra, vui lòng gửi tệp
báo cáo lỗi với các chi tiết bên dưới và các bước để tái tạo sự cố."
        extra={
          <Button type="primary" onClick={handleBackHome}>
            Back Home
          </Button>
        }
        className="w-1/2 mx-auto"
      >
        <div className="text-lg">
          <div>
            <span className="font-bold">Error: </span> {error}
          </div>
          <div>
            <span className="font-bold">Detail: </span>
            {error_description ?? ''}
          </div>
        </div>
      </Result>
    </div>
  );
};
