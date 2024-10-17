var passport = require("passport"),
  requireAuth = passport.authenticate("jwt", { session: false }),
  router = require("express").Router(),
  dashboardCtr = require("../controllers/dashboard.controller");

/*dashboard*/
router.post("/delete-account", requireAuth, dashboardCtr.deleteAccount);

/*integration*/

router.post("/get-master-level-by-accountid", requireAuth, dashboardCtr.getMasterLevelByAccountId);

//integration-tradelocker
router.post("/add-master-account", requireAuth, dashboardCtr.addMasterAccount);
router.post("/add-copier-account", requireAuth, dashboardCtr.addCopierAccount);

//integration-metatrader
router.post("/add-metatrader-master-account", requireAuth, dashboardCtr.addMetatraderMasterAccount);
router.post("/add-metatrader-copier-account", requireAuth, dashboardCtr.addMetatraderCopierAccount);

/*masters*/
router.post("/get-masters-list", requireAuth, dashboardCtr.getMastersList);
router.post("/add-follow-master-account", requireAuth, dashboardCtr.addFollowMasterAccount);
router.post("/remove-follow-master-account", requireAuth, dashboardCtr.removeFollowMasterAccount);
router.post("/upgrade-master-plan", requireAuth, dashboardCtr.upgradeMasterPlan);

/*manage master*/
router.post("/update-master-description", requireAuth, dashboardCtr.updateMasterDescription);
router.post("/get-master-by-accountid", requireAuth, dashboardCtr.getMasterByAccountId);
router.post("/get-follow-copiers-list", requireAuth, dashboardCtr.getFollowCopiersList);
router.post("/get-master-description", requireAuth, dashboardCtr.getMasterDescription);
router.post("/upload-avatar", requireAuth, dashboardCtr.uploadAvatar);
router.post("/delete-avatar", requireAuth, dashboardCtr.deleteAvatar);

/*copiers*/
router.post("/get-copiers-list", requireAuth, dashboardCtr.getCopiersList);
router.post("/get-my-masters-list", requireAuth, dashboardCtr.getMyMastersList);
router.post("/start-trading", requireAuth, dashboardCtr.startTrading);
router.post("/stop-trading", requireAuth, dashboardCtr.stopTrading);
router.post("/disconnect-master", requireAuth, dashboardCtr.disconnectMaster);

/*copiers action*/
router.post("/add-my-master", requireAuth, dashboardCtr.addMyMaster);

/*manage copier*/
router.post("/get-copier-by-accountid", requireAuth, dashboardCtr.getCopierByAccountId);
router.post("/update-copier-risk-settings", requireAuth, dashboardCtr.updateCopierRiskSettings);
router.post("/update-copier-position-settings", requireAuth, dashboardCtr.updateCopierPositionSettings);
router.post("/update-profit-share-method", requireAuth, dashboardCtr.updateProfitShareMethod);

/*billing*/
router.post("/get-transaction-history", requireAuth, dashboardCtr.getTransactionHistory);
router.post("/get-trading-history", requireAuth, dashboardCtr.getTradingHistory);
router.post("/get-copier-trading-history", requireAuth, dashboardCtr.getCopierTradingHistory);

module.exports = router;