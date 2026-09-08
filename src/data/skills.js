import {
  SiJavascript,
  SiHtml5,
  SiCss,
  SiPython,
  SiPhp,
  SiDart,
  SiFlutter,
  SiKotlin,
  SiFirebase,
  SiAndroidstudio,
  SiGit,
  SiFigma,
} from 'react-icons/si';
import { FaJava, FaFilm } from 'react-icons/fa';
import { VscVscode } from 'react-icons/vsc';
import CanvaIcon from '../components/icons/CanvaIcon';

export const SKILLS = [
  { id: 'js',      name: 'JavaScript',     Icon: SiJavascript,    color: '#F7DF1E' },
  { id: 'html',    name: 'HTML5',          Icon: SiHtml5,         color: '#E34F26' },
  { id: 'css',     name: 'CSS3',           Icon: SiCss,           color: '#1572B6' },
  { id: 'java',    name: 'Java',           Icon: FaJava,          color: '#f89820' },
  { id: 'python',  name: 'Python',         Icon: SiPython,        color: '#3776AB' },
  { id: 'php',     name: 'PHP',            Icon: SiPhp,           color: '#777BB4' },
  { id: 'dart',    name: 'Dart',           Icon: SiDart,          color: '#0175C2' },
  { id: 'flutter', name: 'Flutter',        Icon: SiFlutter,       color: '#54C5F8' },
  { id: 'kotlin',  name: 'Kotlin',         Icon: SiKotlin,        color: '#7F52FF' },
  { id: 'firebase',name: 'Firebase',       Icon: SiFirebase,      color: '#FFCA28' },
  { id: 'android', name: 'Android Studio', Icon: SiAndroidstudio, color: '#3DDC84' },
  { id: 'git',     name: 'Git',            Icon: SiGit,           color: '#F05032' },
  { id: 'vscode',  name: 'VS Code',        Icon: VscVscode,       color: '#007ACC' },
  { id: 'canva',   name: 'Canva',          Icon: CanvaIcon,       color: '#00C4CC' },
  { id: 'capcut',  name: 'CapCut',         Icon: FaFilm,          color: '#ff4757' },
  { id: 'figma',   name: 'Figma',          Icon: SiFigma,         color: '#F24E1E' },
];
