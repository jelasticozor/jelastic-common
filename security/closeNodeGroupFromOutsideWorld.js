const APPID = getParam("TARGET_APPID")

function checkJelasticResponse(response, errorMsg) {
  if (!response || response.result !== 0) {
    throw errorMsg + ": " + response
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

function removeFirewallRule(rule) {
  resp = jelastic.environment.security.RemoveRule(APPID, session, rule.id)
  checkJelasticResponse(resp, "Unable to remove security rule " + rule.name)
}

function addFirewallRule(nodeGroup, rule) {
    resp = jelastic.environment.security.AddRule(APPID, session, rule, nodeGroup = nodeGroup)
    checkJelasticResponse(resp, "Unable to add security rule " + rule.name)  
}

function openNodeGroupToLoadBalancerOnly(nodeGroup, relatedNodeGroup) {
  rules = getFirewallInBoundRules(nodeGroup)

  for (var i = 0; i < rules.length; ++i) {
    removeFirewallRule(rules[i])

    delete rules[i]["id"]
    rules[i]["relatedNodeGroup"] = relatedNodeGroup

    addFirewallRule(nodeGroup, rules[i])
  }
}

function disableSlbAccess(nodeGroup) {
  resp = jelastic.environment.nodegroup.SetSLBAccessEnabled(APPID, session, nodeGroup=nodeGroup, enabled=false)
  checkJelasticResponse(resp, "Unable to disable SLB access on node group " + nodeGroup)
}

const nodeGroup = getParam("nodeGroup")
const relatedNodeGroup = getParam("relatedNodeGroup")

openNodeGroupToLoadBalancerOnly(nodeGroup, relatedNodeGroup)
disableSlbAccess(nodeGroup)

return {result: 0}