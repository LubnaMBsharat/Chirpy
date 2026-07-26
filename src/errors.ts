export class BadRequestError extends Error{
    name : string;
    code: number;
    constructor(message:string){
        super(message);
        this.name = "Bad Request";
        this.code = 400;
    }    
}

export class UnauthorizedError extends Error{
    name: string;
    code: number;
    constructor(message:string){
        super(message);
        this.name = "Unauthorized";
        this.code = 401;
    }
}

export class ForbiddenError extends Error{
    name: string;
    code: number;
    constructor(message:string){
        super(message);
        this.name = "Forbidden";
        this.code = 403;
    }
}

export class NotFoundError extends Error{
    name: string;
    code: number;
    constructor(message:string){
        super(message);
        this.name = "Not Found";
        this.code = 404;
    }
}