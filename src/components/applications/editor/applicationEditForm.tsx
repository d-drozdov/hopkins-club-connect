import { Field, Form } from "houseform";
import { useEffect, useState } from "react";

import ApplicationPublishConfirmationDialog, {
  ConfirmationFormType,
} from "~/components/applications/editor/applicationPublishConfirmationDialog";
import ErrorDialog from "~/components/errorDialog";
import { Textarea } from "~/components/shadcn_ui/textarea";
import { api } from "~/utils/api";
import Button from "../../button";
import ErrorMessage from "../../dashboard/errorMessage";
import { Input } from "../../shadcn_ui/input";
import ApplicationForm from "../applicationForm";
import ApplicationPreviewDialog from "./applicationPreviewDialog";
import QuestionsEditor from "./questionsEditor";

import type { ClubApplicationQuestion } from "@prisma/client";

type ApplicationFormType = {
  name: string;
  description: string;
};

type PropType = {
  applicationId: string;
  clubId: string;
  name?: string;
  description?: string;
  questions: ClubApplicationQuestion[];
  saveApplication: (
    name: string,
    description: string,
    questions: ClubApplicationQuestion[],
  ) => Promise<void>;
  publishApplication: (
    name: string,
    description: string,
    values: ConfirmationFormType,
    questions: ClubApplicationQuestion[]
  ) => void,
};

const ApplicationEditForm = (props: PropType) => {
  const { clubId, name, description, questions, applicationId, saveApplication, publishApplication } =
    props;

  const [questionsState, setQuestionsState] = useState<
    ClubApplicationQuestion[]
  >([]);
  const [openErrorDialog, setOpenErrorDialog] = useState(false);
  const [openPreviewDialog, setOpenPreviewDialog] = useState(false);

  useEffect(() => {
    setQuestionsState(questions);
  }, []);

  const isApplicationFormValid = (name: string, description: string) => {
    if (name.trim() === "" || description.trim() === "") {
      return false;
    }
    for (const question of questionsState) {
      if (
        question.question === "" ||
        question.type === undefined ||
        question.required === undefined
      ) {
        return false;
      }

      for (const answerChoice of question.clubApplicationAnswerChoices) {
        if (answerChoice === "") {
          return false;
        }
      }
    }
    return true;
  };

  const confirmPublishApplication = (
    name: string,
    description: string,
    values: ConfirmationFormType
  ) => {
    publishApplication(name, description, values, questionsState);
  }

  return (
    <>
      <Form<ApplicationFormType>
        onSubmit={(values) => {
          if (!isApplicationFormValid(values.name, values.description)) {
            setOpenErrorDialog(true);
            return;
          }
          
          saveApplication(
            values.name,
            values.description,
            questionsState,
          );
        }}
      >
        {({ submit, getFieldValue }) => (
          <main className="flex flex-col items-center gap-4 py-4">
            <section className="mx-10 flex w-[50rem] flex-col gap-4">
              <Field
                name="name"
                initialValue={name}
              // onBlurValidate={z.string().min(1, "Enter an application name")}
              >
                {({ value, setValue, onBlur, isValid, errors }) => (
                  <>
                    <span className="text-xl font-semibold">
                      Application Name
                    </span>
                    <Input
                      className="h-[4rem]"
                      placeholder="Enter Application Name"
                      value={value}
                      onChange={(e) => setValue(e.currentTarget.value)}
                      onBlur={onBlur}
                    />
                    {!isValid && <ErrorMessage message={errors[0]} />}
                  </>
                )}
              </Field>

              <Field name="description" initialValue={description}>
                {({ value, setValue, onBlur, isValid, errors }) => (
                  <>
                    <span className="text-xl font-semibold">
                      Application Description
                    </span>
                    <Textarea
                      className="rounded-xl bg-white p-4"
                      placeholder={"Enter an application description"}
                      onChange={(e) => setValue(e.target.value)}
                      value={value}
                      onBlur={onBlur}
                      rows={4}
                    />
                    {!isValid && <ErrorMessage message={errors[0]} />}
                  </>
                )}
              </Field>
            </section>
            <section className="flex flex-col items-center gap-4 py-8">
              <span className="text-center text-4xl font-semibold ">
                Questions
              </span>
              <QuestionsEditor
                questionsState={questionsState}
                setQuestionsState={setQuestionsState}
              />
            </section>

            <div className="flex grow flex-row justify-end gap-4">
              <Button
                onClick={() => {
                  submit().catch((e) => console.log(e));
                }}
              >
                Save
              </Button>

              <ApplicationPreviewDialog
                triggerButton={
                  <button className="max-w-xs rounded-xl bg-white/10 px-4 py-4 backdrop-invert transition duration-300 ease-in-out hover:scale-110">
                    <h1 className="tracking-none font-black uppercase text-white">
                      Preview
                    </h1>
                  </button>
                }
                dialogDescription={""}
                openDialog={openPreviewDialog}
                setOpenDialog={setOpenPreviewDialog}
              >
                <ApplicationForm
                  clubId={clubId as string}
                  name={getFieldValue("name")?.value}
                  description={getFieldValue("description")?.value}
                  questions={questionsState}
                  clubApplicationId={applicationId}
                  readonly
                />
              </ApplicationPreviewDialog>

              <ApplicationPublishConfirmationDialog
                name={getFieldValue("name")?.value}
                description={getFieldValue("description")?.value}
                isApplicationFormValid={isApplicationFormValid}
                confirmPublishApplication={confirmPublishApplication}
                setErrorDialogOpen={setOpenErrorDialog}
              />
            </div>

            <ErrorDialog
              dialogDescription={
                "Please make sure that all fields are filled out!"
              }
              openDialog={openErrorDialog}
              setOpenDialog={setOpenErrorDialog}
            />
          </main>
        )}
      </Form>
    </>
  );
};

export default ApplicationEditForm;
