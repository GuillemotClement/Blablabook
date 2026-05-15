import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtPayload } from 'src/security/token/types';

type AuthenticatedRequest = {
  user?: JwtPayload;
};

export const CurrentUserId = createParamDecorator(
  (_data: unknown, context: ExecutionContext): number => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    return request.user?.sub as number;
  },
);
