import { AzureFunction, Context, HttpRequest } from "@azure/functions"

const eventEmitter: AzureFunction = async function (context: Context, req: HttpRequest): Promise<void> {
    const event = req.body.event;

    let queueTriggered = '';
    let queueMessage = '';

    switch (event) {
        case 'Panama.View.GClassroom.Copy':
            queueTriggered = 'view-gclassroom-process';
            queueMessage = JSON.stringify({"job_type": "Skinner.View.GClassroom.Process"});
            context.bindings.triggerViewGClassroomProcess = queueMessage;
            break;
        case 'Panama.View.IAMWP.Copy':
            queueTriggered = 'view-iamwp-process';
            queueMessage = 'Flenderson.View.IAMWP.Process';
            context.bindings.triggerViewIAMWPProcess = queueMessage;
            break;
        case 'Panama.View.SkinnerAssignments.Copy':
            queueTriggered = 'view-skinnerassignments-process';
            queueMessage = JSON.stringify({"job_type": "Skinner.View.SkinnerAssignments.Process"});
            context.bindings.triggerViewSkinnerAssignmentsProcess = queueMessage;
            break;
        case 'Panama.View.SkinnerStaff.Copy':
            queueTriggered = 'view-skinnerstaff-process';
            queueMessage = JSON.stringify({"job_type": "Skinner.View.SkinnerStaff.Process"});
            context.bindings.triggerViewSkinnerStaffProcess = queueMessage;
            break;
        case 'Panama.View.StaffDir.Copy':
            queueTriggered = 'view-staffdir-process';
            queueMessage = 'Flenderson.View.StaffDir.Process';
            context.bindings.triggerViewStaffDirProcess = queueMessage;
            break;
        default:
            break;
    }

    let responseMessage = `Sent ${queueMessage} to ${queueTriggered}`;

    context.res = {
        status: 200,
        body: {
            "result": responseMessage
        }
    };
    context.log(responseMessage);
    context.done(null, responseMessage);
};

export default eventEmitter;
