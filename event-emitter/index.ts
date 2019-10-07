import { AzureFunction, Context, HttpRequest } from "@azure/functions";
import { createLogObject } from "../SharedCode/createLogObject";
import { createLogBlob } from "../SharedCode/createLogBlob";
import { createCallbackMessage } from "../SharedCode/createCallbackMessage";
import { createEvent } from "../SharedCode/createEvent";

const eventEmitter: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const functionInvocationID = context.executionContext.invocationId;
    const functionInvocationTime = new Date();
    const functionInvocationTimestamp = functionInvocationTime.toJSON();  // format: 2012-04-23T18:25:43.511Z

    const functionName = context.executionContext.functionName;
    const functionEventType = 'WRDSB.Panama.Event.Emit';
    const functionEventID = `panama-functions-${functionName}-${functionInvocationID}`;
    const functionLogID = `${functionInvocationTime.getTime()}-${functionInvocationID}`;

    const logStorageAccount = process.env['storageAccount'];
    const logStorageKey = process.env['storageKey'];
    const logStorageContainer = 'function-event-emitter-logs';

    const eventLabel = '';
    const eventTags = [
        "panama", 
    ];

    const event = context.bindings.triggerMessage;
    const eventType = event.type;

    let queueTriggered = '';
    let queueMessage = '';

    switch (eventType) {
        case 'WRDSB.Panama.View.GClassroom.Copy':
            queueTriggered = 'view-gclassroom-process';
            queueMessage = JSON.stringify({"job_type": "Skinner.View.GClassroom.Process"});
            context.bindings.triggerViewGClassroomProcess = queueMessage;
            break;
        case 'WRDSB.Panama.View.IAMWP.Copy':
            queueTriggered = 'view-iamwp-process';
            queueMessage = 'Flenderson.View.IAMWP.Process';
            context.bindings.triggerViewIAMWPProcess = queueMessage;
            break;
        case 'WRDSB.Panama.View.SkinnerAssignments.Copy':
            queueTriggered = 'view-skinnerassignments-process';
            queueMessage = JSON.stringify({"job_type": "Skinner.View.SkinnerAssignments.Process"});
            context.bindings.triggerViewSkinnerAssignmentsProcess = queueMessage;
            break;
        case 'WRDSB.Panama.View.SkinnerStaff.Copy':
            queueTriggered = 'view-skinnerstaff-process';
            queueMessage = JSON.stringify({"job_type": "Skinner.View.SkinnerStaff.Process"});
            context.bindings.triggerViewSkinnerStaffProcess = queueMessage;
            break;
        case 'WRDSB.Panama.View.StaffDir.Copy':
            queueTriggered = 'view-staffdir-process';
            queueMessage = 'Flenderson.View.StaffDir.Process';
            context.bindings.triggerViewStaffDirProcess = queueMessage;
            break;
        default:
            break;
    }

    const logPayload = {
        status: "200",
        message: `Sent ${queueMessage} to ${queueTriggered}`,
        queueMessage: queueMessage,
        queueTriggered: queueTriggered
    };

    // Log function invocation and results
    const logObject = await createLogObject(functionInvocationID, functionInvocationTime, functionName, logPayload);
    const logBlob = await createLogBlob(logStorageAccount, logStorageKey, logStorageContainer, logObject);
    context.log(logBlob);

    // Callback for internal consumption
    const callbackMessage = await createCallbackMessage(logObject, logPayload.status);
    context.bindings.callbackMessage = JSON.stringify(callbackMessage);
    context.log(callbackMessage);
    
    context.done(null, logBlob);
};

export default eventEmitter;
