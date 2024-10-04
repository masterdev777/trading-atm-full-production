var passport = require("passport"),
    requireAuth = passport.authenticate("jwt", { session: false }),
    router = require("express").Router(),
    cryptochillCtr = require("../controllers/cryptochill.controller");

router.post("/pay-crypto", requireAuth, cryptochillCtr.payCrypto);
router.post("/withdraw-crypto", requireAuth, cryptochillCtr.withdrawCrypto);
router.post("/cryptochill-callback", cryptochillCtr.cryptoChillCallback);

module.exports = router;