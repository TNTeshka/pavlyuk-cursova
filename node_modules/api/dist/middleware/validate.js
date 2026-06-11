export function validate(schemas) {
    return (req, _res, next) => {
        if (schemas.params)
            req.params = schemas.params.parse(req.params);
        if (schemas.query)
            req.query = schemas.query.parse(req.query);
        if (schemas.body)
            req.body = schemas.body.parse(req.body);
        next();
    };
}
