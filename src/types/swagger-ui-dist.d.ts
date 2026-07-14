declare module 'swagger-ui-dist' {
  interface SwaggerUiDist {
    getAbsoluteFSPath: () => string;
  }

  const swaggerUiDist: SwaggerUiDist;
  export default swaggerUiDist;
}
