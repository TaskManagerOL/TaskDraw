const isProduction = process.env.NODE_ENV === 'production';
const wsBackEndUrl = !isProduction?"ws://localhost:8080/ws":"/ws";
const httpBackEndUrl = !isProduction?"http://localhost:8080":"";

export { wsBackEndUrl, httpBackEndUrl, isProduction };