# Financial model

The Insights dashboard includes a transparent scenario calculator. It is a hypothetical business-case model, not a forecast and not an observed benefit.

## Inputs

- annual case volume;
- baseline recovery rate;
- assumed improvement in percentage points;
- average item value;
- minutes saved per case;
- staff cost per hour;
- one-time implementation costs;
- recurring annual operating costs.

## Formulas

```text
additional items returned = annual cases × improvement points / 100
additional item value returned = additional items × average item value
staff hours released = annual cases × minutes saved / 60
gross staff capacity value = staff hours released × staff cost per hour
year-one net modelled benefit = gross staff capacity value − recurring costs − implementation costs
steady-state net modelled benefit = gross staff capacity value − recurring costs
```

Returned item value is reported separately and is not counted as operator financial savings. The low/base/high table changes improvement points and minutes saved; stakeholders must replace assumptions with approved local estimates.
