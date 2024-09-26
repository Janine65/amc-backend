import { GlobalHttpException } from "./globalHttpException";

class AuthenticationTokenMissingException extends GlobalHttpException {
  constructor() {
    super(401, 'Authentication token missing');
  }
}

export default AuthenticationTokenMissingException;