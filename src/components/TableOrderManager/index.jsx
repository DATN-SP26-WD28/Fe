import { AlarmClockCheck, CheckCheck, ClipboardCheck, CookingPot, Users } from 'lucide-react'
import React from 'react'

const TableOrderManager = () => {
  return (
    <>
      {/* Bàn 1 */}
      <div className='text-sm flex items-stretch gap-2 border border-gray-300 p-2 rounded-md min-w-24 min-h-24'>
        <section className='flex flex-col items-center justify-center gap-2'>
          <div className='font-semibold text-center text-lg'>1</div>
          <div className='flex items-center gap-2'>
            <Users size={16} />
            <span>0</span>
          </div>
        </section>
        <div className='shrink-0 w-[1px] flex-shrink-0 flex-grow h-auto bg-gray-300'></div>
        {/* <section className='flex flex-col gap-2'>
          <div className='flex items-center'>
            <AlarmClockCheck size={16} />
            <span className='ml-2 font-semibold'>1</span>
          </div>
          <div className='flex items-center'>
            <CookingPot size={16} />
            <span className='ml-2 font-semibold'>1</span>
          </div>
          <div className='flex items-center'>
            <CheckCheck size={16} />
            <span className='ml-2 font-semibold'>1</span>
          </div>
        </section> */}
        <section className='flex flex-col items-center justify-center gap-2'>
          <ClipboardCheck size={16} />
          <span className='flex justify-between items-center text-sm'>Trống</span>
        </section>
      </div>
      {/* Bàn 2 */}
      <div className='text-sm flex items-stretch gap-2 border border-gray-300 p-2 rounded-md min-w-24 min-h-24'>
        <section className='flex flex-col items-center justify-center gap-2'>
          <div className='font-semibold text-center text-lg'>1</div>
          <div className='flex items-center gap-2'>
            <Users size={16} />
            <span>0</span>
          </div>
        </section>
        <div className='shrink-0 w-[1px] flex-shrink-0 flex-grow h-auto bg-gray-300'></div>
        {/* <section className='flex flex-col gap-2'>
          <div className='flex items-center'>
            <AlarmClockCheck size={16} />
            <span className='ml-2 font-semibold'>1</span>
          </div>
          <div className='flex items-center'>
            <CookingPot size={16} />
            <span className='ml-2 font-semibold'>1</span>
          </div>
          <div className='flex items-center'>
            <CheckCheck size={16} />
            <span className='ml-2 font-semibold'>1</span>
          </div>
        </section> */}
        <section className='flex flex-col items-center justify-center gap-2'>
          <ClipboardCheck size={16} />
          <span className='flex justify-between items-center text-sm'>Trống</span>
        </section>
      </div>
      {/* Bàn 3 */}
      <div className='text-sm flex items-stretch gap-2 border border-gray-300 p-2 rounded-md min-w-24 min-h-24'>
        <section className='flex flex-col items-center justify-center gap-2'>
          <div className='font-semibold text-center text-lg'>1</div>
          <div className='flex items-center gap-2'>
            <Users size={16} />
            <span>0</span>
          </div>
        </section>
        <div className='shrink-0 w-[1px] flex-shrink-0 flex-grow h-auto bg-gray-300'></div>
        <section className='flex flex-col gap-2'>
          <div className='flex items-center'>
            <AlarmClockCheck size={16} />
            <span className='ml-2 font-semibold'>1</span>
          </div>
          <div className='flex items-center'>
            <CookingPot size={16} />
            <span className='ml-2 font-semibold'>1</span>
          </div>
          <div className='flex items-center'>
            <CheckCheck size={16} />
            <span className='ml-2 font-semibold'>1</span>
          </div>
        </section>
      </div>
    </>
  )
}

export default TableOrderManager