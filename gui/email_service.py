import os 
from azure.communication.email import EmailClient

POLLER_WAIT_TIME = 10

def waiting_func(poller):
    time_elapsed = 0
    while not poller.done():
        poller.wait(POLLER_WAIT_TIME)
        time_elapsed += POLLER_WAIT_TIME

        if time_elapsed > 18 * POLLER_WAIT_TIME:
            raise RuntimeError("Polling timed out.")

    if poller.result()["status"] == "Succeeded":
        return f"Successfully sent the email (operation id: {poller.result()['id']})"
    else:
        raise RuntimeError(str(poller.result()["error"]))
    
def reset(link, email):
    connection_string = os.environ['AAMKS_MAIL_API_KEY']
    email_client = EmailClient.from_connection_string(connection_string)

    with open(f"{os.environ['AAMKS_PATH']}/gui/mail_template/password_reset.html", "r") as file:
        file_contents = file.read()
        file_contents.replace("{ur}", link)

    message = {
        "senderAddress": "DoNotReply@28526e37-59b2-4d33-ab12-50ab69c4a520.azurecomm.net",
        "recipients":  {
            "to": [{"address": email }],
        },
        "content": {
            "subject": "AAMKS reset password",
            "html": file_contents,
        }
    }
    poller = email_client.begin_send(message)

    result = waiting_func(poller)
    return result

def activate(link, email):
    connection_string = os.environ['AAMKS_MAIL_API_KEY']
    email_client = EmailClient.from_connection_string(connection_string)

    with open(f"{os.environ['AAMKS_PATH']}/gui/mail_template/activation.html", "r") as file:
        file_contents = file.read()
        file_contents.replace("{ur}", link)

    message = {
        "senderAddress": "DoNotReply@28526e37-59b2-4d33-ab12-50ab69c4a520.azurecomm.net",
        "recipients":  {
            "to": [{"address": email }],
        },
        "content": {
            "subject": "AAMKS activate your account",
            "html": file_contents,
        }
    }
    poller = email_client.begin_send(message)

    result = waiting_func(poller)
    return result