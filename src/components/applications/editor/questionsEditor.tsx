import "@prisma/client";

import {
  ClubApplicationQuestion,
  ClubApplicationQuestionType,
} from "@prisma/client";
import update from "immutability-helper";
import { Dispatch, SetStateAction, useCallback } from "react";
import { SquarePlus } from "tabler-icons-react";

import DraggableCard from "~/components/draggableCard";
import AnswerChoicesEditor from "./answerChoicesEditor";
import QuestionCard from "./questionCard";

type PropType = {
  questionsState: ClubApplicationQuestion[];
  setQuestionsState: Dispatch<SetStateAction<ClubApplicationQuestion[]>>;
};

const QuestionsEditor = (props: PropType) => {
  const { questionsState, setQuestionsState } = props;

  const updateQuestionsState = (
    field: string,
    value: boolean | string | string[] | ClubApplicationQuestionType,
    index: number,
    question: ClubApplicationQuestion,
  ) => {
    const newQuestionsForm = questionsState;
    newQuestionsForm[index] = {
      id: question.id,
      required: question.required,
      type: question.type,
      question: question.question,
      orderNumber: question.orderNumber,
      clubApplicationAnswerChoices: question.clubApplicationAnswerChoices,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
      [field]: value,
    } as unknown as ClubApplicationQuestion;
    setQuestionsState([...newQuestionsForm]);
  };

  const deleteQuestion = (index: number) => {
    const newQuestionsForm = questionsState;
    newQuestionsForm.splice(index, 1);
    setQuestionsState([...newQuestionsForm]);
  };

  const moveQuestions = useCallback((dragIndex: number, hoverIndex: number) => {
    setQuestionsState((prevQuestions: ClubApplicationQuestion[]) =>
      update(prevQuestions, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevQuestions[dragIndex] as ClubApplicationQuestion],
        ],
      }),
    );
  }, []);

  return (
    <>
      <section className="border-1 w-[75rem] rounded-2xl border border-black bg-gradient-to-r from-primary to-secondary p-10">
        {questionsState.map((question, index: number) => {
          return (
            <DraggableCard
              className="border-1 my-4 rounded-xl border border-white p-4"
              key={`question${index}${question.question}`}
              index={index}
              moveCard={moveQuestions}
            >
              <QuestionCard
                question={question as ClubApplicationQuestion}
                index={index}
                updateQuestionsState={updateQuestionsState}
                deleteQuestion={deleteQuestion}
              />

              <div className="ml-20">
                {question.type ===
                  ClubApplicationQuestionType.MULTIPLE_CHOICE ||
                question.type ===
                  ClubApplicationQuestionType.MULTIPLE_SELECT ? (
                  <AnswerChoicesEditor
                    question={question as ClubApplicationQuestion}
                    questionIndex={index}
                    updateQuestionsState={updateQuestionsState}
                  />
                ) : (
                  <></>
                )}
              </div>
            </DraggableCard>
          );
        })}

        <div className="flex flex-row py-10">
          <button
            className="group flex flex-row items-center justify-center"
            onClick={() => {
              setQuestionsState([
                ...questionsState,
                {
                  id: undefined,
                  required: undefined,
                  question: "",
                  type: undefined,
                  clubApplicationAnswerChoices: [],
                } as unknown as ClubApplicationQuestion,
              ]);
            }}
          >
            <div className="flex flex-row items-center">
              <SquarePlus className="mx-auto h-14 w-14 text-white duration-300 group-hover:rotate-90 group-hover:cursor-pointer group-hover:text-secondary" />
              <h1 className="tracking-none whitespace-nowrap text-2xl font-black uppercase text-white group-hover:cursor-pointer group-hover:text-gray">
                Create Question
              </h1>
            </div>
          </button>
        </div>
      </section>
    </>
  );
};

export default QuestionsEditor;
