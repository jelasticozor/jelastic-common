const APPID = getParam("TARGET_APPID")

function checkJelasticResponse(response, errorMsg) {
  if (!response || response.result !== 0) {
    throw errorMsg + ": " + response;
  }
}

function getFirewallInBoundRules(nodeGroup) {
  var resp = jelastic.environment.security.GetRules(APPID, session, nodeGroup = nodeGroup, direction = "IN")
  checkJelasticResponse(resp, "Unable to get security rules")
  rules = resp.rules
  rules.shift()
  rules.pop()
  return rules
}

function removeFirewallRule(ruleId) {
  resp = jelastic.environment.security.RemoveRule(APPID, session, rules[i].id)
  checkJelasticResponse(resp, "Unable to remove security rule " + rules[i].name)
}

function addFirewallRule(nodeGroup, rule) {
    resp = jelastic.environment.security.AddRule(APPID, session, rule, nodeGroup = nodeGroup)
    checkJelasticResponse(resp, "Unable to add security rule " + rule.name)  
}

function openNodeGroupToLoadBalancerOnly(nodeGroup, relatedNodeGroup) {
  rules = getFirewallInBoundRules(nodeGroup)

  for (var i = 0; i < rules.length; ++i) {
    removeFirewallRule(rules[i].id)

    delete rules[i]["id"]
    rules[i]["relatedNodeGroup"] = relatedNodeGroup

    addFirewallRule(nodeGroup, rules[i])
  }
}

function disableSlbAccess(nodeGroup) {
  var resp = jelastic.environment.nodegroup.SetSLBAccessEnabled(nodeGroup=nodeGroup, enabled=false)
  checkJelasticResponse(resp, "Unable to disable slb access to node group " + nodeGroup)
}

openNodeGroupToLoadBalancerOnly(getParam("nodeGroup"), getParam("relatedNodeGroup"))
disableSlbAccess(getParam("nodeGroup"))

return {result: 0}