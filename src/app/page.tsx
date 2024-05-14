'use client'

import Image from "next/image";
import LightMode from './icons/lightmode.svg';
import DarkMode from './icons/darkmode.svg';
import Trash from './icons/trash.svg';
import Pointer from './icons/pointer.svg';
import {CSSProperties, ReactNode, useEffect, useState} from "react";
import {
    defaultCoordinates,
    DndContext,
    KeyboardSensor,
    MouseSensor, PointerSensor,
    TouchSensor,
    useDraggable,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {Coordinates, CSS} from '@dnd-kit/utilities';
import {guid} from "@/utils/guid";

const getRandomNumber = (min:number, max:number) => {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

const Button = ({children, onClick, className}: {children?: ReactNode; onClick?: () => void; className?: string;}) => {
    return <div onClick={onClick} className={`flex justify-center items-center cursor-pointer bg-gray-300 ${className}`}>
        {children}
    </div>
}

const Folder = ({top, left, folderName, isMinimized, onMinimize, onClose}: {top: number; left: number; isMinimized: boolean; folderName: string; onMinimize: () => void; onClose: () => void;}) => {
    const {attributes, listeners, setNodeRef, transform} = useDraggable({
        id: 'd',
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    }

    return <div
        style={{...style, top, left,}}
        {...attributes}
        className={`z-50  absolute w-[700px] border-black border-[3px] h-[500px] flex flex-col bg-white ${isMinimized ? 'hidden' : 'visible'}`}>
        <div className={'h-6 flex bg-black/30 px-2'} {...listeners}>
            <div>{folderName}</div>
            <div id={'icons'} className={'flex ml-auto gap-6'}>
                <div onClick={onMinimize} className={'cursor-pointer'}>-</div>
                <div onClick={onClose} className={'cursor-pointer'}>x</div>
            </div>
        </div>
    </div>
}

const FolderWrapper = ({folderName, isMinimized, onMinimize, onClose}: {folderName: string; isMinimized: boolean; onMinimize: () => void; onClose: () => void;}) => {
    const [{x, y}, setCoordinates] = useState<Coordinates>({x: (window.innerWidth/2)-350, y: (window.innerHeight/2)-250});

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )
    return <DndContext
        sensors={sensors}
        onDragEnd={({delta}) => {
            setCoordinates(({x, y}) => {
                return {
                    x: x + delta.x,
                    y: y + delta.y,
                };
            });
        }}>
        <Folder top={y} left={x} isMinimized={isMinimized} onMinimize={onMinimize} folderName={folderName} onClose={onClose}/>
    </DndContext>
}

const IconWrapper = ({children, onClick, label, left, top}: {children?: ReactNode; onClick: () => void; label: string; left?: number; top?: number;}) => {

    const {attributes, listeners, setNodeRef, transform} = useDraggable({
        id: 'd',
    });

    const style = {
        transform: CSS.Translate.toString(transform),
    }

    return (
            <div
                {...listeners}
                onClick={onClick}
                ref={setNodeRef}
                className={'w-20 focus:border-[3px] focus:bg-gray-300 absolute cursor-pointer text-sm flex flex-col items-center justify-center h-20'}
                style={{...style, top, left,}}
                {...attributes}
            >
                    <div>{children}</div>
                    <div>{label}</div>
            </div>)
}

const TrashCan = ({onClick}: {onClick: () => void;}) => {
    const [{x, y}, setCoordinates] = useState<Coordinates>({x: getRandomNumber(100, window.innerWidth-200), y: getRandomNumber(100, window.innerHeight-200)});

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(MouseSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    )

    return (
        <DndContext
            sensors={sensors}
            onDragEnd={({delta}) => {
                setCoordinates(({x, y}) => {
                    return {
                        x: x + delta.x,
                        y: y + delta.y,
                    };
                });
            }}
        >
            <IconWrapper onClick={onClick} label={'trash'} top={y} left={x}>
                <Image className={'h-8 w-8'} src={Trash} alt={'light mode'} />
            </IconWrapper>
        </DndContext>)
}

export default function Home() {
    const [{x, y}, setMousePosition] = useState({x: 0, y: 0})
    const [darkMode, setDarkMode] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString())

    const [openedFolders, setOpenedFolders] = useState<{folderName: string; isOpen: boolean; id: string;}[]>([])

    useEffect(() => {
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000)

        return () => clearInterval(timeInterval);
    }, [])

    const move = (e: MouseEvent) => {
        setMousePosition({x: (e?.clientX || 0)-8, y: (e?.clientY || 0)-2});
    }

    useEffect(() => {
        document.addEventListener('mousemove', move)

        return () => document.removeEventListener('mousemove', move);
    })


  return (
      <>
          <div
              id="cursor"
              style={{ position: 'absolute', pointerEvents: 'none', zIndex: 9999999, fill: 'white', left: `${x}px`, top: `${y}px` }}
          >
              <Image className={'h-8 w-8'} src={Pointer} alt={'pointer'} />

          </div>
          {openedFolders.map(folder => <FolderWrapper key={folder.id} folderName={folder.folderName} isMinimized={!folder.isOpen} onMinimize={() => {
              const currentFolders = [...openedFolders];
              currentFolders[currentFolders.findIndex(x => x.id === folder.id)].isOpen = false;

              setOpenedFolders(currentFolders);
          }} onClose={() => setOpenedFolders(openedFolders.filter(x => x.id !== folder.id))} />)}
    <div className={'w-screen h-screen max-h-screen overflow-hidden text-[#1D3557] flex flex-col'}>
        <div className={'w-full box-border relative py-2 flex justify-center items-center'}>
            {/*<div onClick={() => setDarkMode(!darkMode)} className={'absolute cursor-pointer left-4'}>*/}
            {/*    <Image className={'h-10 w-10'} src={darkMode ? LightMode : DarkMode} alt={'light mode'} />*/}
            {/*</div>*/}
            <div className={'flex flex-col items-center'}>
                <div className={'text-[32px] font-bold'}>pat.OS</div>
                <div>welcome to my interactive portfolio</div>
            </div>
        </div>
        <div className={'relative justify-center items-center'}>
            <TrashCan onClick={() => {
                setOpenedFolders([...openedFolders, {folderName: 'test1', isOpen: true, id: guid()}])
            }}/>
            <TrashCan onClick={() => {
                setOpenedFolders([...openedFolders, {folderName: 'test2', isOpen: true, id: guid()}])
            }}/>
            <TrashCan onClick={() => {
                setOpenedFolders([...openedFolders, {folderName: 'test3', isOpen: true, id: guid()}])
            }}/>
        </div>
        <div className={'border-t-[3px] bg-white border-black flex  w-full absolute bottom-0 h-12'}>
            <div className={'h-full cursor-pointer w-32 border-r-[3px] border-black flex items-center justify-center hover:bg-gray-300'}>
                start
            </div>
            <div className={'flex items-center'}>
                {openedFolders.map(folder =>
                    <div className={'w-48 bg-gray-200 h-full items-center px-2 flex border-r-[3px] border-black border-dashed'} key={folder.id}>
                        <div>{folder.folderName}</div>
                        <div className={'flex gap-1 ml-auto'}>
                        <Button onClick={() => {
                            const currentFolders = [...openedFolders];
                            const currentState = currentFolders[currentFolders.findIndex(x => x.id === folder.id)].isOpen;
                            currentFolders[currentFolders.findIndex(x => x.id === folder.id)].isOpen = !currentState;

                            setOpenedFolders(currentFolders);
                        }} className={'cursor-pointer w-6 h-6'}>{folder.isOpen ? '-' : '+'}</Button>
                        <Button onClick={() => setOpenedFolders(openedFolders.filter(x => x.id !== folder.id))} className={'cursor-pointer w-6 h-6'}>x</Button>
                        </div>
                        </div>)}
            </div>
            <div className={'ml-auto flex items-center justify-center border-l-[3px] h-full border-black w-32'}>
                {currentTime}
            </div>
        </div>
    </div>
          </>
  );
}
