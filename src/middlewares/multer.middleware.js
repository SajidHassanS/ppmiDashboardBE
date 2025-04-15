export function setProfileImgPath(req, res, next) {
  req.storagePath = `../static/images/ppmi-dashboard/profilepic`;
  next();
}
