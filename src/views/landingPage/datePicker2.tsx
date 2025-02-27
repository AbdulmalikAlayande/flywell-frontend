import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { MdOutlineEditCalendar, MdRocketLaunch } from "react-icons/md";
import { styled } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';
import Alert from '@mui/material/Alert';

import React from 'react';
import Logger from '@src/utils/logger';
import assert from 'assert';
import { useTheme } from '@src/useTheme';

import { twMerge } from 'tailwind-merge';
import {
    DatePickerToolbar,
    DatePickerToolbarProps,
} from '@mui/x-date-pickers/DatePicker'
import OutsideClickHandler from '../components/reusables/outsideClickHandler';

type DatePickerProps = {
    onClear: (value?: object | null)=>void;
    onChange?: ((value: Date | null) => void);
    label: string;
    minDate?: Date; 
    maxDate?: Date;
    
}

const StyledButton = styled(IconButton)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
}));
  
const StyledDay = styled(PickersDay)(({ theme }) => ({
    borderRadius: theme.shape.borderRadius,
    color: "#2563eb",
    ...theme.applyStyles('light', {
      color: "#1e40af",
    }),
}));

function CustomToolbar(props: DatePickerToolbarProps<Date>){
    return (
        <div className={`${props.className} flex items-center justify-between`}>
            <DatePickerToolbar {...props} />
            <MdRocketLaunch fontSize={30} className={"m-5"}/>
        </div>
    )
}

/**
 * A customizable date picker component with validation and clear functionality.
 * 
 * @component
 * @param {DatePickerProps} props - The props for the DatePicker2 component
 * @param {string} props.label - The label text for the date picker
 * @param {Date} [props.minDate] - The minimum selectable date
 * @param {Date} [props.maxDate] - The maximum selectable date
 * @param {(date: Date | null) => void} [props.onChange] - Callback fired when date is changed
 * @param {(date: Date | null) => void} [props.onClear] - Callback fired when date is cleared
 * 
 * @remarks
 * Uses Material-UI's DatePicker component internally with custom styling and behavior.
 * Includes error handling for date validation and displays success alert when cleared.
 * 
 * @ts-expect-error
 * The ownerState prop is required by MUI but type definitions are incomplete.
 * This is a known issue with MUI's TypeScript definitions where the ownerState
 * prop is not properly typed in the component's props interface.
 */
const DatePicker2 = (props: DatePickerProps) => {
    const themeContext  = useTheme();

    const [error, setError] = React.useState(false);

    const [cleared, setCleared] = React.useState<boolean>(false);
    

    const handleClear = (event: { preventDefault: () => void; }) => {

        event.preventDefault();
        setCleared(true);
        props.onClear(null);
        setTimeout(() => setCleared(false), 2000);
    }

    function handleChange(date: Date | null) {
        
        assert(date instanceof Date, "Date should be an instance of Date");

        if (date < (props.minDate ?? new Date(0)) || date > (props.maxDate ?? new Date(8640000000000000)))
            setError(true);

        else
            setError(false);

        if (props.onChange !== undefined)
            props.onChange(date);

        else
            Logger.warning("onChange is undefined");
    }

    return (
        <div className="w-full h-full flex items-center relative">
            <DatePicker 
                label={props.label} 
                onChange={(date) => {
                    handleChange(date);
                }}
                maxDate={props.maxDate}
                minDate={props.minDate}
                slots={{
                    openPickerIcon: MdOutlineEditCalendar,
                    openPickerButton: StyledButton,
                    day: StyledDay,
                    toolbar: CustomToolbar,
                }}
                slotProps={{
                    field: { 
                        clearable: true, 
                        onClear: handleClear
                    },
                    openPickerIcon: { fontSize: 'large' },
                    openPickerButton: { 
                        color: 'primary' 
                    },
                    toolbar: {
                        toolbarFormat: 'yyyy',
                        toolbarPlaceholder: '??',
                    },
                    actionBar: {
                        actions: ['clear'],
                        // @ts-expect-error ownerState props probably doesn't exists on this none
                        ownerState: undefined,
                    },
                    textField: {
                        InputProps: {
                            style: {
                                backgroundColor: themeContext.theme === 'dark' ? '#364153' : '#F8F8FF',
                                borderRadius: "12px",
                                height: "100%",                                  
                            },
                        },
                        // variant: 'filled',
                        // focused: true,
                        color: 'primary',
                        error: error,
                        helperText: error ? "Date is required" : "",
                        className: twMerge(`
                            w-full h-full px-4 py-2 text-sm md:text-lg 
                            rounded-lg md:rounded-tr-xl 
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                            ${error ? "border-red-500 ring-red-500" : "border-gray-300"}
                        `)
                    },
                }}
            />
            
            {cleared && (
                <OutsideClickHandler onClick={() => setCleared(false)}>
                    <Alert className='absolute bottom-0 right-0'severity="success">
                        Field cleared!
                    </Alert>
                </OutsideClickHandler>
            )}
        </div>
    )
}

export default DatePicker2
