import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createLogObject } from "../SharedCode/createLogObject";
import { createLogBlob } from "../SharedCode/createLogBlob";
import { createCallbackMessage } from "../SharedCode/createCallbackMessage";
import { createEvent } from "../SharedCode/createEvent";

const viewSkinnerAssignmentsCopy: AzureFunction = async function (context: Context, triggerMessage: string): Promise<void> {
    const functionInvocationID = context.executionContext.invocationId;
    const functionInvocationTime = new Date();
    const functionInvocationTimestamp = functionInvocationTime.toJSON();  // format: 2012-04-23T18:25:43.511Z

    const functionName = context.executionContext.functionName;
    const functionEventType = 'WRDSB.Panama.View.SkinnerAssignments.Copy';
    const functionEventID = `panama-functions-${functionName}-${functionInvocationID}`;
    const functionLogID = `${functionInvocationTime.getTime()}-${functionInvocationID}`;

    const logStorageAccount = process.env['storageAccount'];
    const logStorageKey = process.env['storageKey'];
    const logStorageContainer = 'function-view-skinnerassignments-copy-logs';

    const eventLabel = '';
    const eventTags = [
        "panama", 
    ];
    let logPayload;
    let statusCode;
    let statusMessage;

    const incomingBlob = context.bindings.incomingBlob;

    if (incomingBlob.length < 5000) {
        statusCode = "404"
        statusMessage = "Error: Too few sourece records. Aborting.";
    } else {
        statusCode = "200";
        statusMessage = "Success: Copied trillium-view-skinnerassignments/incoming.json to trillium-view-skinnerassignments/now.json.";

        // Copy blob contents
        context.bindings.outgoingBlob = incomingBlob;
    }

    logPayload = {
        status: statusCode,
        message: statusMessage,
        incomingBlob: "trillium-view-skinnerassignments/incoming.json",
        outgoingBlob: "trillium-view-skinnerassignments/now.json"
    };

    // Log function invocation and results
    const logObject = await createLogObject(functionInvocationID, functionInvocationTime, functionName, logPayload);
    const logBlob = await createLogBlob(logStorageAccount, logStorageKey, logStorageContainer, logObject);
    context.log(logBlob);

    // Callback for internal consumption
    const callbackMessage = await createCallbackMessage(logObject, statusCode);
    context.bindings.callbackMessage = JSON.stringify(callbackMessage);
    context.log(callbackMessage);
    
    // Fire event for external consumption
    const invocationEvent = await createEvent(functionInvocationID, functionInvocationTime, functionInvocationTimestamp, functionName, functionEventType, functionEventID, functionLogID, statusCode, statusMessage, logStorageAccount, logStorageContainer, eventLabel, eventTags);
    context.bindings.flynnEvent = JSON.stringify(invocationEvent);
    context.log(invocationEvent);

    context.done(null, logBlob);
};

export default viewSkinnerAssignmentsCopy;
