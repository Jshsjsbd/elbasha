declare module './firebase' {
  export interface FirebaseAdmin {
    firestore(): any;
    auth(): any;
  }
  const admin: FirebaseAdmin;
  export default admin;
}
