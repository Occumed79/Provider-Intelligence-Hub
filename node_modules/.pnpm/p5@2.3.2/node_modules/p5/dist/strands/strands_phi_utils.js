import { recordInBasicBlock } from './ir_cfg.js';
import { getNodeDataFromID, propagateTypeToAssignOnUse, getOrCreateNode } from './ir_dag.js';
import { BaseType, NodeType } from './ir_types.js';
import './strands_FES.js';

function createPhiNode(strandsContext, phiInputs, varName) {
  // Determine the proper dimension and baseType from the inputs
  const validInputs = phiInputs.filter(input => input.value.id !== null);
  if (validInputs.length === 0) {
    throw new Error(`No valid inputs for phi node for variable ${varName}`);
  }

  // Get dimension and baseType from first valid input, skipping ASSIGN_ON_USE nodes
  const inputNodes = validInputs.map((input) => getNodeDataFromID(strandsContext.dag, input.value.id));

  // Find first non-ASSIGN_ON_USE input to determine type
  let typeSource = inputNodes.find((input) => input.baseType !== BaseType.ASSIGN_ON_USE && input.dimension) ??
    inputNodes.find((input) => input.baseType !== BaseType.ASSIGN_ON_USE);

  // If all are ASSIGN_ON_USE, fall back to first input
  if (!typeSource) {
    typeSource = inputNodes[0];
  }

  const dimension = typeSource.dimension;
  const baseType = typeSource.baseType;

  // Propagate the type to all ASSIGN_ON_USE inputs
  if (baseType !== BaseType.ASSIGN_ON_USE) {
    for (const input of inputNodes) {
      if (input.baseType === BaseType.ASSIGN_ON_USE) {
        propagateTypeToAssignOnUse(strandsContext.dag, input.id, baseType, dimension);
      }
    }
  }

  const nodeData = {
    nodeType: NodeType.PHI,
    dimension,
    baseType,
    dependsOn: phiInputs.map(input => input.value.id).filter(id => id !== null),
    phiBlocks: phiInputs.map(input => input.blockId)};
  const id = getOrCreateNode(strandsContext.dag, nodeData);
  recordInBasicBlock(strandsContext.cfg, strandsContext.cfg.currentBlock, id);
  return {
    id,
    dimension,
    baseType
  };
}

export { createPhiNode };
