import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GetUser = createParamDecorator(
  (data: string, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    // Si se pasa un argumento como `data`, retorna solo esa propiedad del usuario
    return data ? user?.[data] : user;
  },
);