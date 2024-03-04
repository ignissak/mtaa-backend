import { Response } from 'express';

export namespace Res {
  export function not_found(res: Response) {
    return res
      .status(404)
      .json({ status: 404, success: false, error: 'Not found!', data: [] });
  }

  export function forbidden(res: Response, error: string = 'Forbidden') {
    return res
      .status(403)
      .json({ status: 403, success: false, error: error, data: [] });
  }

  export function body_missing(res: Response) {
    return res.status(500).json({
      status: 500,
      success: false,
      error: 'Request Body is missing',
      data: [],
    });
  }

  export function success(res: Response, object: unknown) {
    return res.status(200).json({ status: 200, success: true, data: object });
  }

  export function property_required(res: Response, property: string) {
    return res.status(400).json({
      status: 400,
      success: false,
      error: 'Property ' + property + 'is required!',
      data: [],
    });
  }

  export function properties_required(res: Response, properties: string[]) {
    return res.status(400).json({
      status: 400,
      success: false,
      error: 'Properties ' + properties + ' are required!',
      data: [],
    });
  }

  export function bad_request(res: Response, message: string) {
    return res
      .status(400)
      .json({ status: 400, success: false, error: message, data: [] });
  }

  export function error(res: Response, err: Error) {
    return res
      .status(500)
      .json({ status: 500, success: false, error: err.message, data: [] });
  }

  export function errorWithText(res: Response, err: string) {
    return res
      .status(500)
      .json({ status: 500, success: false, error: err, data: [] });
  }

  export function unauthorized(res: Response) {
    return res
      .status(403)
      .json({ status: 403, success: false, error: 'Unauthorized!', data: [] });
  }

  export function conflict(res: Response) {
    return res
      .status(409)
      .json({ status: 409, success: false, error: 'Conflict!', data: [] });
  }

  export function created(res: Response, data: unknown) {
    return res.status(201).json({ status: 201, success: true, data });
  }
}
