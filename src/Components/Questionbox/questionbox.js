import React, { useState, useRef, useEffect} from 'react'
import './questionbox.css'
import TextareaAutosize from 'react-autosize-textarea';
import ToggleButton from 'react-toggle-button';
import axios from 'axios';

export const Questionbox = (props) => {
    const [isEdit, setIsEdit] = useState(false);
    const [isPublic, setIsPublic] = useState(false);
    const [isFoucs, setIsFocus] = useState(false);

    // variables about follow-up questions  
    const [followUpQuestions, setfollowUpQuestions] = useState("empty");
    const [isFollowUp, setIsFollowUp] = useState(false);
    const [followClicked, setFollowClicked] = useState(false);
    const [followQuestion, setFollowQuestion] = useState("");

    // variables about questions
    const [prevQuestion, setPrevQuestion] = useState("");
    const [currentQuestion, setCurrentQuestion] = useState("");

    // variables about answers 
    const [prevAnswer, setPrevAnswer] = useState("");
    const [currentAnswer, setCurrentAnswer] = useState("");

    // check is regenerate
    const [isRegenerate, setIsRegenerate] = useState(false);

    const textAreaRef = useRef(null);

    useEffect(() => {
        setPrevQuestion(props.question);
        setCurrentQuestion(props.question);
        setPrevAnswer(props.answer);
        setCurrentAnswer(props.answer);
        setIsPublic(props.isPublic);
    }, [])

    async function addFollowUpQuestion (prevQuestion, prevAnswer) {
        if(!isFollowUp) {
            setIsFollowUp(true);
            await axios({
                method: "POST",
                url: "https://qna-restapi-dxpyj.run.goorm.site/getFUQuestion",
                data: {
                    title: props.title,
                    abstract: props.abstract,
                    question: prevQuestion,
                    answer: prevAnswer
                },
                headers: {'Content-Type': 'application/json'}
            })
            .then ((response) => {
                const res = response.data;
                setfollowUpQuestions(JSON.parse((res)));
                props.logging("getFollowQ", res);
            })
            .catch(error =>{
                console.log("error");
            })
            setIsFollowUp(false);
        }
    }


    useEffect(() => {
        if(textAreaRef.current) {
            textAreaRef.current.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }, [currentAnswer]);

    // useEffect(()=> {
    //     setIsWaitAnswer(props.isWaitAnswer);
    //     if(props.isWaitAnswer === false) {
    //         cancelContent();
    //     }
    // }, [props.isWaitAnswer]);

    const currentQuestionHandler = (e) => {
        e.preventDefault();
        setCurrentQuestion(e.target.value);
    }

    const currentAnswerHandler = (e) => {
        e.preventDefault();
        setCurrentAnswer(e.target.value);
    }

    function changeIsEdit() {
        setCurrentAnswer(props.answer);
        setIsEdit(true);
        if(textAreaRef.current) {
            textAreaRef.current.focus();
        }
        props.logging("editQnA", "");
    }

    function cancelContent() {
        setCurrentAnswer(prevAnswer);
        setCurrentQuestion(prevQuestion);
        setIsEdit(false);
    }

    function changeContent() {
        props.updateQuestion(currentQuestion);
        props.updateAnswer(currentAnswer);
        setPrevAnswer(currentAnswer);
        setPrevQuestion(currentQuestion);
        setIsEdit(false);
    }

    function changePublic(isPublic) {
        props.updatePublic(!isPublic);
        setIsPublic(!isPublic);
        props.logging("editPublic", "");
    }

    function requestfollowUp() {
        if (!isFollowUp) {
            setfollowUpQuestions("empty");
            addFollowUpQuestion(currentQuestion, currentAnswer);
        }
    }

    async function regenerateAnswer () {
        setCurrentAnswer("Regenerate Answer...");
        setfollowUpQuestions("empty");
        setIsRegenerate(true);
        setIsEdit(false);
        await props.regenerateAnswer(currentQuestion);
        setPrevAnswer(props.answer);
        setCurrentAnswer(props.answer);
        props.logging("regenerateA", props.answer);
        setIsRegenerate(false);
    }

    const handleFocus = () => {
        setIsFocus(true);
    };
    
    const handleBlur = () => {
        setIsFocus(false);
        props.logging("changeOrder", "");
    };

    const requestFollowUpQuestion = async (question) => {
        setFollowQuestion(question);
        setFollowClicked(true);
        await props.addFollowUpAnswer(question, props.myIndex);
        setFollowClicked(false);
        setfollowUpQuestions("empty");
        props.logging("addFollowQ",question);
    }

    return(
        <div key={props.myIndex} tabIndex="0" onFocus={handleFocus} onBlur={handleBlur}>
            <div className='questionbox'>
                <div className='contatiner'>
                    <div className='questionbar'>
                        <div className='question'>
                            {isEdit ? <TextareaAutosize className='editQuestion' ref={textAreaRef} value={currentQuestion} onChange={currentQuestionHandler} onResize={(e) => {}}/> : <div>{currentQuestion}</div>}
                        </div>
                        <div className='buttons'>
                            <div className='makepublic'>
                                make public
                            </div>
                            <ToggleButton
                                className='toggleBtn'
                                inactiveLabel={''}
                                activeLabel={''}
                                colors={{
                                    activeThumb: {
                                        base: 'rgb(164,44,37)'
                                    },
                                    inactiveThumb: {
                                        base: 'rgb(190,154,152)'
                                    },
                                    active: {
                                        base: 'rgb(234,209,207)',
                                        hover: 'rgb(242,217,215)'
                                    },
                                    inactive: {
                                        base: 'rgb(234,209,207)',
                                        hover: 'rgb(242,217,215)'
                                    }
                                }}
                                containerStyle={{width:'42px'}}
                                trackStyle={{width:'42px'}}
                                thumbAnimateRange={[0, 24]}
                                value={ isPublic }
                                onToggle={(value) => {
                                    changePublic(value);
                                }} 
                                />
                            <img src="images/trash.png" alt={'delete button'} className='deleteBtn' onClick={props.deleteQuestion}/>
                        </div>
                    </div>
                    <div className='answerbox'>
                        <div className='answer'>
                            {isEdit ? <TextareaAutosize className='editAnswer' ref={textAreaRef} value={currentAnswer} onChange={currentAnswerHandler} onResize={(e) => {}}/> : <div>{currentAnswer}</div>}
                        </div>
                    </div>
                    { isRegenerate ?
                        null
                        :
                        <div className='questionFooter'>
                            <div className='advanceBtns'>
                                <button onClick={regenerateAnswer} className='redoBtn'><img src="images/redo.svg" alt={'redo button'}/> Regenerate <b>Answer</b></button>
                                <button onClick={requestfollowUp}>Recommend <b>Follow-up Question</b></button>
                            </div>
                            <div className='buttonContainer'>
                                {isEdit ? <div className='editBtns'><button className='cancelBtn' onClick={cancelContent}>cancel</button> <button className='completeBtn' onClick={changeContent}>complete</button></div> : <button onClick={changeIsEdit}>Edit the QnA</button>}
                            </div>   
                        </div>
                        
                    }
                </div>
                {isRegenerate?
                    null
                    :
                    <img key={props.id} tabIndex="0" className='handle' src="images/handle.svg" alt="handle" {...props.handle} onMouseDown={handleBlur} onMouseUp={handleFocus}/>       
                }
            </div>
                <div className='followUpQuestionContainer'>
                    {followClicked ? 
                        <div className='tempoQuestionbox'>
                            <div className='questionbar'>{followQuestion}</div>
                            <div className='answerbox'>Answer is being generated...</div>
                        </div>
                        :
                        (isFoucs ?
                            ( followUpQuestions !== "empty" ?
                                (followUpQuestions.map((question, index) => (<div key={index} className='followUpQuestion' onClick={() => requestFollowUpQuestion(question)}>{question}</div>)))
                                :
                                (isFollowUp ?
                                    <div className='loadingHolder'>
                                        <img className='loading' src="images/loading.gif" alt="loading" />
                                    </div>
                                    :
                                    null
                                )
                            )
                            :
                            null
                        )
                    }
                </div> 
        </div>
    )
}