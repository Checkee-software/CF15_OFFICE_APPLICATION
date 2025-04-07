type TAPIResponse<DataResponse> = Promise<
    | {
          status: 'failure';
          statusCode?: number;
          data?: DataResponse;
          message?: string;
      }
    | {
          status: 'successfully';
          statusCode?: number;
          data: DataResponse;
          message?: string;
      }
>;

export default TAPIResponse;
