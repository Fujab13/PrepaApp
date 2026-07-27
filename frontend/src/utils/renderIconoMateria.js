import { createElement, isValidElement } from 'react'
import * as FaIcons from 'react-icons/fa'
import * as Fa6Icons from 'react-icons/fa6'
import * as FiIcons from 'react-icons/fi'
import * as PiIcons from 'react-icons/pi'
import * as BsIcons from 'react-icons/bs'
import * as MdIcons from 'react-icons/md'
import * as RiIcons from 'react-icons/ri'
import * as BiIcons from 'react-icons/bi'
import * as AiIcons from 'react-icons/ai'
import * as IoIcons from 'react-icons/io'
import * as Io5Icons from 'react-icons/io5'
import * as LuIcons from 'react-icons/lu'
import * as GiIcons from 'react-icons/gi'
import * as CgIcons from 'react-icons/cg'
import * as ImIcons from 'react-icons/im'
import * as SiIcons from 'react-icons/si'
import * as HiIcons from 'react-icons/hi'
import * as Hi2Icons from 'react-icons/hi2'
import * as LiaIcons from 'react-icons/lia'
import * as SlIcons from 'react-icons/sl'
import * as RxIcons from 'react-icons/rx'
import * as VscIcons from 'react-icons/vsc'

const iconSet = {
  ...FaIcons,
  ...Fa6Icons,
  ...FiIcons,
  ...PiIcons,
  ...BsIcons,
  ...MdIcons,
  ...RiIcons,
  ...BiIcons,
  ...AiIcons,
  ...IoIcons,
  ...Io5Icons,
  ...LuIcons,
  ...GiIcons,
  ...CgIcons,
  ...ImIcons,
  ...SiIcons,
  ...HiIcons,
  ...Hi2Icons,
  ...LiaIcons,
  ...SlIcons,
  ...RxIcons,
  ...VscIcons,
}

export function renderIconoMateria(icono, props = {}) {
  if (!icono) return null

  if (isValidElement(icono)) return icono

  const iconName = typeof icono === 'string' ? icono : ''
  const Icono = iconSet[iconName]

  if (!Icono) return null

  return createElement(Icono, { size: 20, ...props })
}
